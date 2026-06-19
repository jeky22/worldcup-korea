import { getHighlightVideos, getNews } from "../src/lib/feeds";

async function main() {
  console.log("=== 하이라이트 영상 ===");
  const vids = await getHighlightVideos(5);
  for (const v of vids) console.log(`- ${v.title} | ${v.id} | ${v.published.slice(0, 10)}`);
  console.log(`(총 ${vids.length})`);

  console.log("\n=== 뉴스 ===");
  const news = await getNews(6);
  for (const n of news)
    console.log(`- [${n.source}] ${n.title} | img:${n.image ? "Y" : "N"} | ${n.published.slice(0, 16)}`);
  console.log(`(총 ${news.length})`);
}

main().then(() => process.exit(0));
