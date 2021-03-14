const API_KEY = 'eb3394a2de5eb5523183fab392873e657bbfc5ef3cfddcd9503e9e30775f5485'

const tickersHandlers = new Map();

// export const loadAllCoins = () => {
//     fetch("https://min-api.cryptocompare.com/data/all/coinlist")
//         .then(r => r.json())
//         .then(rawData => {
//             const allCoins = Object.fromEntries(rawData);
//             console.log(allCoins)
//             return allCoins;
//         })
// }

// TODO: Refactor to use URLSearchParams
const loadTickers = () =>{

    if (tickersHandlers.size === 0){
        return;
    }

    fetch(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${
            [...tickersHandlers.keys()].join(",")
        }&tsyms=USD&api_key=${API_KEY}`)
        .then(r => r.json())
        .then(rawData => {
            const updatedPrices =  Object.fromEntries(
                Object.entries(rawData).map(([key, value]) => [key, value.USD])                
            );

            Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
                const handlers = tickersHandlers.get(currency) ?? [];
                handlers.forEach(fn => fn(newPrice));
            });   
        });
};  



// Наша задача получать обновления криптовалютных пар с АПИшки

export const subscribeToTicker = (ticker, cb) => {
   const subscribers = tickersHandlers.get(ticker) || [];
   tickersHandlers.set(ticker, [...subscribers, cb]);

};

export const unsubscribeFromTicker = (ticker) => {
    tickersHandlers.delete(ticker)
};

setInterval(loadTickers, 5000);

window.tickers = tickersHandlers;