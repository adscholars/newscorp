function bannerAnimation(){
    
    TweenMax.set([copy1, copy2, copy3, copy4, copy5, copy6a, copy6b, copy6c,   ],  { opacity: 0, y: 10, transformOrigin: "150px 510px" });
    TweenMax.set([product ],  { opacity: 1, x: -210, });

    TweenMax.set([ product, optlogo, logo],  {opacity: 1, });
    TweenMax.set([cta ],  { opacity: 1, scale: 0, transformOrigin: "150px 510px" });
    TweenMax.set([logo, optlogo],  {opacity: 1 });
    
    TweenMax.staggerTo([copy1, copy2, copy3], 0.5, { opacity : 1, y:0, ease: Quad.easeOut, stagger: 0.35, delay: 0} , 0.1);
    
    TweenMax.to([ copy1], 0.5, { y: 0, opacity: 1 , ease: Quad.easeOut, delay: 0 });
    TweenMax.to([ copy2], 0.5, { y: 0, opacity: 1 , ease: Quad.easeOut, delay: 0.25 });
    TweenMax.to([ copy3], 0.5, { y: 0, opacity: 1 , ease: Quad.easeOut, delay: 0.5 });

    TweenMax.to([ copy4], 0.5, { y: 0, opacity: 1, ease: Quad.easeOut, delay: 0.75 });
    TweenMax.to([ product ], 0.75, { x: 0, opacity: 1, ease: Back.easeOut, delay: 1 });
    TweenMax.to([ copy5], 0.5, { y: 0, opacity: 1, ease: Quad.easeOut, delay: 1.25 });
    TweenMax.to([ cta], 0.65, { scale:1, ease: Back.easeOut, delay: 1.75 });

    TweenMax.staggerTo([copy6a, copy6b, copy6c,], 0.75, { opacity : 1, y:0, ease: Quad.easeOut, stagger: 0.35, delay: 2});
   

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
