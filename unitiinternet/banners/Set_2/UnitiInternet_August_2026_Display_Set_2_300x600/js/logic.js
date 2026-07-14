function bannerAnimation(){
    TweenMax.set([ copy1, logoBg, bottomshape,  optlogo, logo],  {opacity: 1, });
    TweenMax.set([cta ],  { opacity: 1, scale: 0, transformOrigin: "80px 560px" });
    TweenMax.set([product],  {x: 200, opacity: 1 });
    TweenMax.set([offer ],  { opacity: 1, scale: 0, transformOrigin: "210px 350px" });
    TweenMax.set([copy1, price1, price2],  {x: -250, opacity: 1 });


    TweenMax.to(copy1, 0.5, { x:0, opacity: 1, ease: Quad.easeOut, delay: 0 });
    TweenMax.to(price1, 0.5, { x:0, opacity: 1, ease: Quad.easeOut, delay: 0.5 });
    TweenMax.to(price2, 0.5, { x:0, opacity: 1, ease: Quad.easeOut, delay: 0.75 });
    TweenMax.to(product, 0.5, { x:0, opacity: 1, ease: Quad.easeOut, delay: 1 });
    
    TweenMax.to([offer], 0.65, { scale: 1, ease: Back.easeOut, delay: 1.5 });
    TweenMax.to([cta], 0.65, { scale: 1, ease: Back.easeOut, delay: 2.25 });


}

function exitbanner() {
    window.open(clickTag, "_blank");
}

function startBanner(){
    var clickelement = document.getElementById("banner");
    clickelement.addEventListener("click", exitbanner);
    bannerAnimation();
}


window.addEventListener("load", startBanner);
