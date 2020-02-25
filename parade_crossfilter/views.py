
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

from django.http import HttpResponse, JsonResponse
from django.core.urlresolvers import reverse
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
def annotations(request, project, conn=None, **kwargs):
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
