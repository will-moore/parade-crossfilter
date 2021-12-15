
#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Copyright (c) 2020 University of Dundee.
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

import json
from setuptools.command.build_py import build_py
from setuptools.command.install import install
from setuptools.command.sdist import sdist
from setuptools import setup, find_packages
import os

def require_npm(command, strict=False):
    """
    Decorator to run NPM prerequisites
    """
    class WrappedCommand(command):
        def run(self):
            if strict or not os.path.isdir(
                    'parade_crossfilter/static/parade_crossfilter/js'):
                self.spawn(['npm', 'install'])
                self.spawn(['npm', 'run', 'build'])
            command.run(self)
    return WrappedCommand

with open("README.md", "r") as fh:
    long_description = fh.read()

# read version from package.json
with open("package.json", "r") as fh:
    json_data = json.loads(fh.read())
    version = json_data["version"]

setup(
    name='parade-crossfilter',
    version=version,
    description="OMERO.web plugin to test crossfilter",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Will Moore",
    packages=find_packages(exclude=['ez_setup']),
    install_requires=['omero-web>=5.6.1'],
    python_requires='>=3',
    keywords=['OMERO.web', 'parade', 'crossfilter'],
    include_package_data=True,
    cmdclass={
        'build_py': require_npm(build_py),
        'install': require_npm(install),
        'sdist': require_npm(sdist, True),
    },
)
