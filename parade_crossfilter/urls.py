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

from django.conf.urls import url

from . import views

urlpatterns = [

    # index 'home page' of the app
    url(r'^$', views.index, name='parade_crossfilter_index'),

    # get Dataset info for all images in Project
    url(r'^datasets/(?P<project>[0-9]+)/$', views.datasets,
        name='pc_datasets'),
    
    # Get annotations on images within a project e.g. ?type=map
    url(r'^annotations/project/(?P<project>[0-9]+)/images/$',
        views.image_annotations, name='pc_image_annotations'),
    url(r'^annotations/screen/(?P<screen>[0-9]+)/wells/$',
        views.well_annotations, name='pc_well_annotations'),

    url(r'^omero_table_as_csv/(?P<file_id>[0-9]+)/$',
        views.omero_table_as_csv, name='pc_omero_table_as_csv'),

    # POST image as {'data': 'data:image/png;base64,fsfssdflksdf....'}
    url(r'^save_image/$', views.save_image, name='pc_save_image'),
]
