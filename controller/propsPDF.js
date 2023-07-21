export const data = {
	outputType: OutputType.Save,
	returnJsPDFDocObject: true,
	fileName: 'Invoice 2021',
	orientationLandscape: false,
	compress: true,
	logo: {
		src: 'https://drive.google.com/file/d/1_D-9m2YBhyENAIxK3ZuD8qMg_7dzEzhg/view?usp=sharing',
		type: 'PNG',
		width: 53.33,
		height: 26.66,
		margin: {
			top: 0,
			left: 0
		}
	},
	stamp: {
		inAllPages: true, //by default = false, just in the last page
		src: 'https://raw.githubusercontent.com/edisonneza/jspdf-invoice-template/demo/images/qr_code.jpg',
		type: 'JPG', //optional, when src= data:uri (nodejs case)
		width: 20, //aspect ratio = width/height
		height: 20,
		margin: {
			top: 0, //negative or positive num, from the current position
			left: 0 //negative or positive num, from the current position
		}
	},
	business: {
		name: 'Agropecuaria Aldana',
		address: 'Guastatoya, El Progreso',
		phone: '79452595',
		email: 'email@example.com',
	},

	invoice: {
		label: 'Invoice #: ',
		num: 19,
		invDate: 'Payment Date: 01/01/2021 18:12',
		invGenDate: 'Invoice Date: 02/02/2021 10:17',
		headerBorder: false,
		tableBodyBorder: false,
		header: [
			{
				title: '#',
				style: {
					width: 10
				}
			},
			{
				title: 'Cliente',
				style: {
					width: 30
				}
			},
			{
				title: 'Producto',
				style: {
					width: 80
				}
			},
			{ title: 'Cantidad' },
			{ title: 'Precio' },
			{ title: 'Total' }
		],
		table: Array.from(Array(10), (item, index) => ([
			index + 1,
			'There are many variations ',
			'Lorem Ipsum is simply dummy text dummy text ',
			200.5,
			4.5,
			'm2',
			400.5
		])),
		additionalRows: [{
			col1: 'Total:',
			col2: '145,250.50',
			col3: 'ALL',
			style: {
				fontSize: 14 //optional, default 12
			}
		},
		{
			col1: 'VAT:',
			col2: '20',
			col3: '%',
			style: {
				fontSize: 10 //optional, default 12
			}
		},
		{
			col1: 'SubTotal:',
			col2: '116,199.90',
			col3: 'ALL',
			style: {
				fontSize: 10 //optional, default 12
			}
		}],
	},
	pageEnable: true,
	pageLabel: 'Page ',
}