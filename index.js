var Telegram = require('telegram-node-bot'),
	axios 	 = require('axios'),
	UtmConverter  = require('utm-converter'),
	TelegramBaseController = Telegram.TelegramBaseController,
	TextCommand = Telegram.TextCommand,
	tg = new Telegram.Telegram('553758275:AAEtxOgmaGbO4PBcH_xjH537bsSP90ty6j0'),
	converter = new UtmConverter();


class StartController extends TelegramBaseController {

    handle($) {
    	$.sendMessage('برای دریافت برنامه زمانی اتوبوسها، موقعیت خود را ارسال کنید');
    	$.sendMessage('سفارش ساخت ربات تلگرام\n📱09124453874\n https://t.me/Mohammadrezashokri\n http://lambda.smart-auto.ir');
    }
}

class OtherwiseController extends TelegramBaseController {
    handle($) {

		if($.message.location)
		{
			var x = $.message.location.longitude,
				y = $.message.location.latitude,
				wgsCoord = [x, y],
				utmResult = converter.toUtm({coord: wgsCoord});

				x = utmResult.coord.x;
				y = utmResult.coord.y;

			axios
				.get(`http://map.tehran.ir/infra/maps/bus-stations/station/list?x=${x}&y=${y}`)
				.then(res => {
					var txt = 'شناسه            نام ایستگاه🚍\n',
						arr = [];

					res.data.items.forEach( function(e, i) {
						arr.push({ 
							text: e.name, 
							callback: (callbackQuery, message) => {
								station($.message.from._id, e.id);
							}
						})
					});

					$.runInlineMenu({
					    layout: 2, 
					    method: 'sendMessage', 
					    params: ['اطلاع از برنامه زمانی اتوبوس با انتخاب  ایستگاه 🚏'],
					    menu: arr
					})

				});
		} else {
			$.sendMessage('موقعیت خود را از قسمت لوکیشن تلگرام ارسال کنید');
		}
    }
}

function station(chatId, id) {
	axios
		.get('http://map.tehran.ir/infra/maps/bus-stations/station/info?id=' + id)
		.then(res => {
			var txt = 'کدخط       مسیر         زمان\n====================\n';

			res.data.item.stops.forEach( function(e, i) {
				txt += e.route_id+ ':   '+ e.origination+ '-'+ e.destination+ '\n'+ e.eta_text+ '\n-------------------------\n';
			});

			tg.api.sendMessage(chatId, txt);
		});
}

tg.router
    .when(
        new TextCommand('/start'),
        new StartController()
    )
    .otherwise(new OtherwiseController());