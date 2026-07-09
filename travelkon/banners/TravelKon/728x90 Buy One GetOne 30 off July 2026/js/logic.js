function bannerAnimation(){
    TweenMax.set([ copy1b, copy1d, logo],  {opacity: 0, });
    TweenMax.set([copy1a, copy1c ],  {scale: 0, });
    TweenMax.set([f1logo],  {opacity: 0, scale: 0.6 });

    TweenMax.to(f1logo, 0.5, { opacity: 1, ease: Quad.easeOut, delay: 0 });
    TweenMax.to(f1logo, 1, { scale: 1, ease: Quad.easeOut, delay: 0 });
    TweenMax.to([f1bg, f1logo], 0.65, { opacity: 0, ease: Back.easeIn, delay: 1.5 });
    TweenMax.to(f1logo, 0.65, { x: 1000, ease: Quad.easeIn, delay: 1.5 });
    TweenMax.to([bg], 0.65, { opacity: 1, ease: Back.easeIn, delay: 1.5 });
    TweenMax.to(logo, 0.5, { opacity:1, ease: Back.easeOut, delay: 2 });
    TweenMax.to(phone, 0.65, { opacity:1, ease: Quad.easeOut, delay: 2 });

    TweenMax.to(copy1a, 0.65, { scale: 1, opacity: 1, transformOrigin: "240px 23px", ease: Back.easeOut, delay: 2.5});
    TweenMax.to(copy1b, 0.65, { scale: 1, opacity: 1, ease: Quad.easeOut, delay: 3 });
    TweenMax.to(copy1c, 0.65, { scale: 1, opacity: 1, transformOrigin: "283px 58px", ease: Back.easeOut, delay: 3.5 });
    TweenMax.to(copy1d, 0.65, { scale: 1, opacity: 1, ease: Quad.easeOut, delay: 4 });
    TweenMax.to(copy1e, 0.65, { scale: 1, opacity: 1, ease: Quad.easeOut, delay: 4.5 });
    TweenMax.to(legal, 0.65, { opacity: 1, ease: Quad.easeOut, delay: 5 });
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