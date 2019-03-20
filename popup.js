const persianToEnglishMap = {
	'۰': 0,
	'۱': 1,
	'۲': 2,
	'۳': 3,
	'۴': 4,
	'۵': 5,
	'۶': 6,
	'۷': 7,
	'۸': 8,
	'۹': 9
};
const convertToEnglishNumbers = (num) => {
	if (!num && typeof num !== 'number') return num;

	return num.toString().split('').map((i) => (/[۰-۹]/.test(i) ? persianToEnglishMap[i] : i)).join('');
};

document.addEventListener('DOMContentLoaded', async () => {
	const calculateElem = document.getElementById('calculate');
	const loadingElem = document.getElementById('loading');
	const totalElem = document.getElementById('total');
	const descriptionElem = document.getElementById('description');

	const tabs = await chrome.tabs.query({
		active: true,
		currentWindow: true
	});

	const tab = tabs[0];

	if (tab.url.includes('web.tap30.org')) {
		const token = await chrome.tabs.executeScript(tab.id, {
			code: `localStorage['token']`
		});

		calculateElem.addEventListener('click', () => {
			calculateElem.disabled = true;
			calculateElem.style.cursor = 'default';
			calculateElem.innerText = 'داره حساب میکنه';
			loadingElem.style.display = 'block';
			totalElem.style.display = 'none';
			descriptionElem.style.display = 'none';
			(async () => {
				const headers = new Headers();
				const url = 'https://tap33.me/api/v2/ride/history/10/';
				let total = 0;
				let page = 1;

				headers.append('x-authorization', token);
				headers.append('Content-Type', 'application/json');

				while (true) {
					try {
						const response = await fetch(`${url}${page}`, {
							method: 'GET',
							headers
						});
						const data = await response.json();

						if (data.data.rideHistories.length === 0) {
							break;
						}

						total += data.data.rideHistories
							.map(({ priceDetail }) => parseInt(convertToEnglishNumbers(priceDetail.tripPrice)))
							.reduce((sum, price) => sum + price, 0);
						page += 1;
					} catch (err) {
						descriptionElem.innerText = `خیلی با تپ‌سی رفتی و الان بیشتر از ${page -
							1} ریکوئست نمیتونم بزنم اما اینقدر فعلا به تپ‌سی پول دادی :)`;
						descriptionElem.style.margin = '-10px 20px 0';
						descriptionElem.style.fontSize = '12px';
						descriptionElem.style.display = 'block';
						break;
					}
				}
				calculateElem.disabled = false;
				calculateElem.style.cursor = 'pointer';
				calculateElem.innerText = 'دوباره حساب کن';
				loadingElem.style.display = 'none';
				totalElem.style.display = 'inline-block';
				new CountUp('total', 0, total).start();
			})();
		});
	} else {
		descriptionElem.style.color = '#ff3434';
		descriptionElem.innerText =
			'خطایی رخ داد :( یادت باشه حتما باید تو سایت web.tap30.org باشی و لاگین کرده باشی تا بتونی از من استفاده کنی';
	}
});
