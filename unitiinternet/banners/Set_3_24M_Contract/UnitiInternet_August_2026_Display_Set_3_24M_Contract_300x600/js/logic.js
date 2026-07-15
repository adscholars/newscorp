loopCount = 0;

function bannerAnimation(){
    maxLoops = 2;
    
    TweenMax.set([copy1, copy2, copy3, copy5  ],  { opacity: 0, y: 20, transformOrigin: "150px 510px" });
    TweenMax.set([copy4 ],  { opacity: 1, scale:0, transformOrigin: "145px 235px" });
    TweenMax.set([ copy6 ],  { opacity: 0, x: -50, transformOrigin: "150px 510px" });
    TweenMax.set([product ],  { opacity: 1, x: -210, });

    TweenMax.set([ product, optlogo, logo],  {opacity: 1, });
    TweenMax.set([cta ],  { opacity: 1, scale: 0, transformOrigin: "150px 510px" });
    TweenMax.set([logo, optlogo],  {opacity: 1 });

    TweenMax.staggerTo([copy1, copy2, copy3], 0.5, { opacity : 1, y:0, ease: Quad.easeOut, stagger: 0.35, delay: 0} , 0.1);
    
    TweenMax.to([ copy1], 0.5, { y: 0, opacity: 1 , ease: Quad.easeOut, delay: 0 });
    TweenMax.to([ copy2], 0.5, { y: 0, opacity: 1 , ease: Quad.easeOut, delay: 0.25 });
    TweenMax.to([ copy3], 0.5, { y: 0, opacity: 1 , ease: Quad.easeOut, delay: 0.5 });

    TweenMax.to([ copy4], 0.5, { scale: 1, ease: Back.easeOut, delay: 0.75 });
    TweenMax.to([ product ], 0.75, { x: 0, opacity: 1, ease: Back.easeOut, delay: 1 });
    TweenMax.to([ copy5], 0.5, { y: 0, opacity: 1, ease: Quad.easeOut, delay: 1.25 });
    TweenMax.to([ cta], 0.65, { scale:1, ease: Back.easeOut, delay: 1.75 });

    TweenMax.to([copy6 ], 0.5, { opacity : 1, x: 0, ease: Quad.easeOut, delay: 2});
    TweenMax.delayedCall(4.5, nextLoop);

}
function nextLoop() {
    loopCount++;

    if (loopCount < maxLoops) {
        bannerAnimation();
    } else {
        // console.log("Animation finished after 2 loops.");
    }
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
