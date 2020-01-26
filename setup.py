
from setuptools import setup, find_packages

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='parade-crossfilter',
    version='0.0.1dev',
    description="OMERO.web plugin to test crossfilter",
    long_description=long_description,
    author="Will Moore",
    packages=find_packages(exclude=['ez_setup']),
    install_requires=['omero-web>=5.6.1'],
    keywords=['OMERO.web', 'parade', 'crossfilter'],
)
