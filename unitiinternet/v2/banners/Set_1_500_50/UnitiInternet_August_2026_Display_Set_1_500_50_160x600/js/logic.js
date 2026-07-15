function bannerAnimation(){
    var tl = new TimelineMax({ repeat: 1, repeatDelay: 3, });

    TweenMax.set([ copy1, bottomshape,  optlogo, logo],  {opacity: 1, });
    TweenMax.set([cta ],  { opacity: 1, scale: 0, transformOrigin: "75px 450px" });
    TweenMax.set([product],  {x: 200, opacity: 1 });
    TweenMax.set([offer ],  { opacity: 1, scale: 0, transformOrigin: "80px 275px" });
    TweenMax.set([copy1, price1, price2],  {x: -250, opacity: 1 });

     tl.to(copy1, 0.5, { x: 0, ease: Quad.easeOut })
      .to(price1, 0.5, { x: 0, ease: Quad.easeOut })
      .to(price2, 0.5, { x: 0, ease: Quad.easeOut },)
      .to(product, 0.5, { x: 0, ease: Quad.easeOut })
      .to(offer, 0.65, { scale: 1, ease: Back.easeOut })
      .to(cta, 0.65, { scale: 1, ease: Back.easeOut });
}

function exitbanner() {
    window.open(clickTag, "_blank");
}

function mouseOvers(){
    TweenMax.to(cta, 0.35, { scale: 1.15, ease: Quad.easeOut, delay: 0 });
    TweenMax.to(cta, 0.5, { scale: 1, ease: Quad.easeOut, delay: 0.25 });

}
function mouseleaves(){
    TweenMax.to(cta, 0.5, { scale: 1.15, ease: Quad.easeOut, delay: 0 });
    TweenMax.to(cta, 0.35, { scale: 1, ease: Quad.easeOut,  delay: 0.25 });
}

function startBanner(){
    var clickelement = document.getElementById("banner");
    clickelement.addEventListener("click", exitbanner);
    bannerAnimation();
}


window.addEventListener("load", startBanner);
