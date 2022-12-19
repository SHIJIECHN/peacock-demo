async function main() {

  const response = await fetch('https://webgl2fundamentals.org/webgl/resources/models/cube/cube.obj');
  const text = await response.text();

  console.log(text);
  parseOBJ(text)

  // 解析obj文件
  function parseOBJ(text) {
    const keywords = {};

    const keywordRE = /(\w*)(?: )*(.*)/; // 去掉每行的第一个空格前面的元素、与后面的空行（若有的话）
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
      const line = lines[lineNo].trim(); // 去掉首位空格
      if (line === '' || line.startsWith('#')) {
        continue;
      }
      const parts = line.split(/\s+/); // 按空格分隔
      const m = keywordRE.exec(line);
      /**
       * m = [
       *  0: v 1.000000 1.000000 -1.000000"
       *  1: "v"
       *  2: "1.000000 1.000000 -1.000000"
       *  groups: undefined
       *  index: 0
       *  input: "v 1.000000 1.000000 -1.000000"
       * ]
       */
      if (!m) {
        continue;
      }
      console.log(m)

      const [, keyword, unparsedArgs] = m;
    }
  }
}
main();