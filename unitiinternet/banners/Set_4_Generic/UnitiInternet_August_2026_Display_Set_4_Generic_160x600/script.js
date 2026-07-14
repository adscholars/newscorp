function initAnimation() {
    const tl = gsap.timeline({ repeat: 0, repeatDelay: 2.5 });
    tl

   .set(".copy", { x: -50 })
   .set(".price", { scale: 1.3, transformOrigin: "80px 250px" })
   .set("#plus", { scale: 2, transformOrigin: "80px 350px" })
   .set("#router", { x: 50 })
   .set(".tick", { y: 10 })
   .set("#cta", { scale: 0, transformOrigin: "80px 545px" })

   //frame1
    .to("#mainContainer", 0, { opacity: 1, ease: Power1.easeIn }, 0)
    .to('#copy1', 0.5, { opacity: 1, x: 0, y: 0, ease: "back.out(1.5)"}, 0.5)
    .to('#price1', 0.5, { opacity: 1, x: 0, y: 0, scale: 1, ease: "back.out(1.5)"}, 1)
    .to('#plus', 0.5, { opacity: 1, x: 0, y: 0, scale: 1, ease: "back.out(1.5)"}, 1.7)
    .to('#copy2, #router', 0.5, { opacity: 1, x: 0, y: 0, ease: "back.out(1.5)"}, 1.9)
    .to('.tick', 0.5, { opacity: 1, x: 0, y: 0, stagger: 0.25, ease: "back.out(1.5)"}, 2.4)
    .to('#cta', 1, { opacity: 1, x: 0, y: 0, scale: 1, ease: "elastic.out(1,0.5)"}, 2.9)

    //frame2
    .to('#price1', 0.5, { opacity: 1, x: 0, y: 0, scale: 0, ease: "back.in(1.5)"}, 6)
    .to('#price2', 0.5, { opacity: 1, x: 0, y: 0, scale: 1, ease: "back.out(1.5)"}, 6.5)

    //frame3
    .to('#price2', 0.5, { opacity: 1, x: 0, y: 0, scale: 0, ease: "back.in(1.5)"}, 8.5)
    .to('#price3', 0.5, { opacity: 1, x: 0, y: 0, scale: 1, ease: "back.out(1.5)"}, 9)

    console.log(tl.totalDuration());
}

function startBanner() {
    mainContainer.style.display = "block";
    document.getElementById('click_area').addEventListener('click', function () {
        window.open(clickTag, '_blank');
    });
    initAnimation();
}
window.addEventListener("load", startBanner);