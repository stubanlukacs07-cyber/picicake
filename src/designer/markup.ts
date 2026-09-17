/* A tervező statikus váza. A felület (ui.js) ezeket az elemeket tölti fel. */
export const DESIGNER_MARKUP = `<div class="head">
    <p class="eyebrow">Desszerttervező</p>
    <h1>Tervezd meg a saját desszertedet</h1>
    <p class="lead">Válassz terméket, ízt, formát és krémszínt, nyomj rá krémet, rakd a helyére a dekort, írj rá feliratot — aztán forgasd körbe. A tervező csak azt kínálja fel, ami az adott terméknél valóban rendelhető.</p>
    <p class="disclaim"><strong>A rendeléshez a képet le kell menteni és csatolni.</strong> A 3D kép alacsony felbontású illusztráció, a valóságtól eltérhet. Csatolt kép nélkül a terv nem jut el a műhelyhez, így nem tudjuk elkészíteni.</p>
  </div>

  <div class="builder">
    <section class="stage">
      <div class="canvas-wrap">
        <div class="canvas" id="canvas" role="img" aria-label="3D desszertterv"></div>
        <div class="grade"></div>
        <div class="grain"></div>
        <div class="badge-hint" id="stageBadges"></div>
      </div>
      <div class="toolbar" id="toolbar"></div>
      <div class="subbar" id="subbar"></div>
      <p class="hintbar" id="hint"></p>
    </section>

    <aside class="panel" id="panel"></aside>
  </div>`;
