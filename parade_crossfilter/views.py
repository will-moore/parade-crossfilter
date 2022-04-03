
#
# Copyright (c) 2019 University of Dundee.
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#

from django.http import HttpResponse, JsonResponse, \
    Http404, StreamingHttpResponse
import re
import json
from PIL import Image
from io import BytesIO
import base64
import numpy as np
from django.urls import reverse
from django.template import loader
from django.templatetags import static

from omeroweb.webclient.decorators import login_required
from omeroweb.webclient.tree import marshal_annotations
from omero.sys import ParametersI

@login_required()
def index(request, conn=None, **kwargs):
    """
    React App Home page 
    """
    # We need to serve the create-react-app build.
    # Load the template html and replace OMEROWEB_INDEX
    template = loader.get_template('parade_crossfilter/index.html')
    html = template.render({}, request)
    omeroweb_index = reverse('index')
    html = html.replace('OMEROWEB_INDEX = dev_omeroweb_index',
                        'OMEROWEB_INDEX = "%s"' % omeroweb_index)
    # update links to static files
    static_dir = static.static('parade_crossfilter/')
    html = html.replace('href="/static/', 'href="%s' % static_dir)
    html = html.replace('src="/static/', 'src="%s' % static_dir)
    return HttpResponse(html)


@login_required()
def datasets(request, project, conn=None, **kwargs):
    """Return {dataset: {name: Dataset, id:1}, image: {id: 2}}."""

    queryService = conn.getQueryService()

    params = ParametersI()
    params.addId(project)
    query = """select d from Dataset as d
               join fetch d.imageLinks imageLinks
               join fetch imageLinks.child
               join fetch d.projectLinks projectLinks
               where projectLinks.parent.id=:id 
            """
    result = queryService.findAllByQuery(query, params, conn.SERVICE_OPTS)
    data = []
    for d in result:
        for link in d.copyImageLinks():
            data.append({
                'dataset': {'id': d.id.val, 'name': d.name.val},
                'image': {'id': link.child.id.val}
            })
    return JsonResponse({'data': data})


@login_required()
def image_annotations(request, project, conn=None, **kwargs):
    """
    Return Annotations on child Images.
    JSON format same as for webclient/api/annotations/?type=map
    """

    ann_type = request.GET.get('type', None)

    # get images in Project
    queryService = conn.getQueryService()
    params = ParametersI()
    params.addId(project)
    query = """select image.id from Image as image
               join image.datasetLinks datasetLinks
               join datasetLinks.parent as dataset
               join dataset.projectLinks projectLinks
               where projectLinks.parent.id=:id
            """
    result = queryService.projection(query, params, conn.SERVICE_OPTS)
    iids = [r[0].val for r in result]
    anns, exps = marshal_annotations(conn,
                                     image_ids=iids,
                                     ann_type=ann_type,
                                     limit=100000)

    return JsonResponse({'annotations': anns, 'experimenters': exps})


@login_required()
def well_annotations(request, screen, conn=None, **kwargs):
    """
    Return Annotations on child Wells.
    JSON format same as for webclient/api/annotations/?type=map
    """

    ann_type = request.GET.get('type', None)

    # get wells in Screen
    queryService = conn.getQueryService()
    params = ParametersI()
    params.addId(screen)
    query = """select well.id from Well as well
               join well.plate plate
               join plate.screenLinks screenLinks
               where screenLinks.parent.id=:id
            """
    result = queryService.projection(query, params, conn.SERVICE_OPTS)
    iids = [r[0].val for r in result]
    anns, exps = marshal_annotations(conn,
                                     well_ids=iids,
                                     ann_type=ann_type,
                                     limit=100000)

    return JsonResponse({'annotations': anns, 'experimenters': exps})


class TableClosingHttpResponse(StreamingHttpResponse):
    """Extension of L{HttpResponse} which closes the OMERO connection."""

    def close(self):
        super(TableClosingHttpResponse, self).close()
        try:
            if self.table is not None:
                print('closing table...')
                self.table.close()
            # logger.debug('Closing OMERO connection in %r' % self)
            if self.conn is not None and self.conn.c is not None:
                self.conn.close(hard=False)
        except Exception:
            print('Failed to clean up connection.', exc_info=True)


@login_required(doConnectionCleanup=False)
def omero_table_as_csv(request, file_id, conn=None, **kwargs):
    """ Returns the OMERO.table as an http response to download csv"""

    query = request.GET.get('query', '*')
    ctx = conn.createServiceOptsDict()
    ctx.setOmeroGroup("-1")

    orig_file = conn.getQueryService().get('OriginalFile', int(file_id))
    if not orig_file:
        return Http404("File Not Found (id:%s)." % file_id, status=404)

    file_name = orig_file.name.val
    name = file_name.replace(" ", "_") + ".csv"
    
    r = conn.getSharedResources()
    table = r.openTable(orig_file, ctx)

    cols = table.getHeaders()
    rows = table.getNumberOfRows()

    offset = kwargs.get('offset', 0)

    range_start = offset
    range_size = kwargs.get('limit', rows)
    range_end = min(rows, range_start + range_size)

    if query == '*':
        hits = range(range_start, range_end)
    else:
        match = re.match(r'^(\w+)-(\d+)', query)
        if match:
            query = '(%s==%s)' % (match.group(1), match.group(2))
        hits = table.getWhereList(query, None, 0, rows, 1)
        # paginate the hits
        hits = hits[range_start: range_end]

    def csv_row_gen(t, h):
        if query == '*':
            # hits are all consecutive rows - can load them in batches
            idx = 0
            batch = 1000
            while(idx < len(h)):
                batch = min(batch, len(h) - idx)
                row_data = [[] for r in range(batch)]
                for col in t.read(range(len(cols)), h[idx], h[idx] + batch).columns:
                    for r in range(batch):
                        row_data[r].append(str(col.values[r]))
                idx += batch
                yield '\n'.join([",".join(row) for row in row_data]) + '\n'
        else:
            for hit in h:
                row_vals = [str(col.values[0]) for col in t.read(range(len(cols)), hit, hit+1).columns]
                yield ",".join(row_vals) + '\n'

    rsp = TableClosingHttpResponse(csv_row_gen(table, hits))
    rsp.conn = conn
    rsp.table = table
    rsp['Content-Type'] = 'application/force-download'
    # rsp['Content-Length'] = ann.getFileSize()
    rsp['Content-Disposition'] = ('attachment; filename=%s' % name)
    return rsp


@login_required(setGroupContext=True)
def save_image(request, conn=None, **kwargs):

    json_data = json.loads(request.body)

    img_data64 = json_data['data'].replace('data:image/png;base64,', '')
    im = Image.open(BytesIO(base64.b64decode(img_data64)))
    # im.show()

    np_array = np.asarray(im)
    red = np_array[::, ::, 0]
    green = np_array[::, ::, 1]
    blue = np_array[::, ::, 2]
    plane_gen = iter([red, green, blue])
    new_image = conn.createImageFromNumpySeq(
        plane_gen,
        "Plot from OMERO.parade",
        sizeC=3)

    return JsonResponse({'image_id': new_image.id})
