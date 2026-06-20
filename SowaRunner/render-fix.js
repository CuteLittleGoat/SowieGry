// Hotfix renderowania: pełny repaint każdej klatki.
// Poprzednie tło było rysowane liniami co kilka pikseli, co na mobile zostawiało powidoki.
function drawBg(){
  clear();
  if (typeof drawingContext !== "undefined") {
    const g = drawingContext.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#aee5ff");
    g.addColorStop(1, "#f4ffe8");
    drawingContext.fillStyle = g;
    drawingContext.fillRect(0, 0, width, height);
  } else {
    background(174, 229, 255);
  }
  noStroke();
  for(const c of clouds){
    c.x -= (mode===SCREEN.RUN ? spd : 1.2) * c.z * .12;
    if(c.x < -120) c.x = width + 120;
    drawCloud(c.x, c.y, c.sz * s, 185);
  }
}
