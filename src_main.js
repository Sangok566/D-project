// 데이터 불러오기
d3.json("../data/articles.json").then(function(articles) {
  // 예시: 기사들 간 키워드 1개 이상 겹치면 연결
  let links = [];
  for (let i = 0; i < articles.length; i++) {
    for (let j = i+1; j < articles.length; j++) {
      const shared = articles[i].keywords.filter(kw => articles[j].keywords.includes(kw));
      if (shared.length > 0) {
        links.push({source: articles[i].id, target: articles[j].id});
      }
    }
  }

  // D3 Force 시뮬레이션
  const width = window.innerWidth;
  const height = document.getElementById('network').offsetHeight;

  const svg = d3.select("#network")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const simulation = d3.forceSimulation(articles)
    .force("link", d3.forceLink(links).id(d => d.id).distance(250))
    .force("charge", d3.forceManyBody().strength(-800))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // 연결선
  const link = svg.selectAll("line.link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link");

  // 행성 노드
  const node = svg.selectAll("g.planet")
    .data(articles)
    .enter()
    .append("g")
    .attr("class", "planet")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );

  node.append("circle")
    .attr("r", 40)
    .attr("fill", "#fff")
    .attr("opacity", 0.15);

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "40px")
    .attr("y", 15)
    .text(d => d.emoji);

  node.append("title")
    .text(d => d.title + '\n' + d.keywords.join(', '));

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("transform", d => `translate(${d.x},${d.y})`);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x; d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x; d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null; d.fy = null;
  }
});