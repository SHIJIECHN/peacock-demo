async function main() {

  const response = await fetch('../../resource/models/cube/cube/obj');
  const text = await response.text();

  console.log(text);

  // 解析obj文件
  function parseOBJ(text) {
    const keywords = {};

    const keywordsRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim(); // 去掉首位空格
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const parts = line.split(/\s+/);
    }
  }
}
main();