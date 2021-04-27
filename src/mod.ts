import { Application, send } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import * as log from "https://deno.land/std@0.88.0/log/mod.ts";
import api from "./api.ts";

const app = new Application();
const PORT = 8000;

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("INFO"),
  },
  loggers: {
    default: {
      level: "INFO",
      handlers: ["console"],
    },
  },
});

// ロギングミドルウェア
app.use(async (cxt, next) => {
  await next();
  const time = cxt.response.headers.get("X-Response-Time");
  log.info(`${cxt.request.method} ${cxt.request.url} ${time}`);
});

// 処理時間計測ミドルウェア
app.use(async (cxt, next) => {
  const start = Date.now();
  await next();
  const delta = Date.now() - start;
  cxt.response.headers.set("X-Response-Time", `${delta}ms`);
});

// APIルータの登録
// APIルータにマッチするパスがない場合には、後続のミドルウェアに処理が移る
app.use(api.routes());
// マッチしなかった場合のリクエストを処理する。OPTIONメソッドへの対応も担当
app.use(api.allowedMethods());

// スタティックファイルを返すミドルウェア
app.use(async (cxt) => {
  const filePath = cxt.request.url.pathname;
  const fileWhitelist = [
    "/index.html",
    "/javascripts/script.js",
    "/stylesheets/style.css",
    "/images/favicon.png",
    "/videos/space_videos.mp4"
  ];
  if (fileWhitelist.includes(filePath)) {
    await send(cxt, filePath, {
      root: `${Deno.cwd()}/public`,
    });
  }
});

app.use(async (cxt) => {
  cxt.response.body = "hey, its me.";
});

if (import.meta.main) {
  // Webサーバの立ち上げ　リクエスト待ち状態になる
  log.info(`start web server in ${PORT}...`);
  await app.listen({
    port: PORT,
  });
}
