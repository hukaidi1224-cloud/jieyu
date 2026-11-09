/**
 * 借雨构建配置。
 * base ＝ GitHub Pages 项目站的子路径，必须与仓库名一致（改动站点地址时只改这里）。
 * 运行时图片路径由 manifest.ts 的 artUrl() 拼 import.meta.env.BASE_URL，
 * 本地 dev／preview 与 vitest 下 BASE_URL 同样是 "/jieyu/"／"/"，不会出现「本地好、线上图全 404」。
 */
import { defineConfig } from "vite";

export default defineConfig({
  base: "/jieyu/",
  build: {
    /** 试玩版全量资源不到 200 KB JS，无需拆分；拆了反而多一轮请求。 */
    chunkSizeWarningLimit: 400,
  },
});
