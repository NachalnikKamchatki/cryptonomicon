const BASE_URL = "wss://streamer.cryptocompare.com/v2";
const API_KEY =
  "eb3394a2de5eb5523183fab392873e657bbfc5ef3cfddcd9503e9e30775f5485";
const AGGREGATE_INDEX = "5";

const tickersHandlers = new Map();

const socket = new WebSocket(`${BASE_URL}?api_key=${API_KEY}`);

socket.addEventListener("message", (e) => {
  const { 
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice
  } = JSON.parse(e.data);
  if (type !== AGGREGATE_INDEX || newPrice === undefined) {
    return;
  }
  const handlers = tickersHandlers.get(currency) ?? [];
                handlers.forEach(fn => fn(newPrice));
});

function sendToWebSocket(message) {
  const stringifiedMsg = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMsg);
    return;
  }

  socket.addEventListener(
    "open",
    () => {
      socket.send(stringifiedMsg);
    },
    { once: true }
  );
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
      action: "SubAdd",
      subs: [`5~CCCAGG~${ticker}~USD`]
  });  
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
      action: "SubRemove",
      subs: [`5~CCCAGG~${ticker}~USD`]
  });  
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeFromTickerOnWs(ticker);
};

