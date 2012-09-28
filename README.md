septa-map
=========

Septa regional rail trains overlayed in real-time over google maps.

- Makes JSONp calls to grab septa transit data (coords, destination, late, etc.)
- Leverages the Google Maps API v3 for mapping.
- Builds map on page load, and updates train markers every 3 seconds.
- Only supports regional rail at this time. Planned support for Bus/Trolley data.