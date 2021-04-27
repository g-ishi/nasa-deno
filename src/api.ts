import { Router } from "https://deno.land/x/oak@v6.5.0/mod.ts";
import * as planets from "./models/planets.ts";
import * as launches from "./models/launches.ts";

const router = new Router();

router.get("/", (cxt) => {
  cxt.response.body = "hey, its me.";
})

router.get("/planets", (cxt) => {
  cxt.response.body = planets.getAll();
})

router.get("/launches", (cxt) => {
  cxt.response.body = launches.getAll();
})

router.get("/launches/:id", (cxt) => {
  if (cxt.params?.id) {
    const launchesList = launches.getOne(Number(cxt.params.id));
    // ある場合だけ返す。存在しないidを指定された場合はクライアントエラーにする。
    if (launchesList) {
      cxt.response.body = launchesList;
    } else {
      cxt.throw(400, "Launch with that ID doesn't exist.");
    }
  }
})

router.post("/launches", async (cxt) => {
  // orkがcontent-typeに応じて適切な形にフォーマットしてくれる。
  // jsonデータをパースするには、content-type: application/json ヘッダが必要。
  const body = await cxt.request.body().value;
  console.log(body);
  // データ追加
  launches.addOne(body);
  // ここまでで例外が上がってなければ成功
  cxt.response.body = { success: true };
  cxt.response.status = 201
})

router.delete("/launches/:id", async (cxt) => {
  if (cxt.params?.id) {
    const result = launches.removeOne(Number(cxt.params.id));
    cxt.response.body = result;
  }
})

export default router;
