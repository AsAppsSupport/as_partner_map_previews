{
    'name': 'Partner Map Preview',
    'version': '19.0.1.1.0',
    'summary': 'Enhanced map preview on partner form with multiple map types, full features',
    'depends': ['base', 'base_geolocalize'],
    'author': 'AS Pvt Ltd',
    'data': [
        'views/res_partner_views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'contact_localization/static/src/css/map_widget.css',
            'contact_localization/static/src/js/map_widget.js',
            'contact_localization/static/src/xml/map_widget.xml',
        ],
    },
    "images": ["static/description/banner.png"],
    'installable': True,
    'license': 'LGPL-3',
}