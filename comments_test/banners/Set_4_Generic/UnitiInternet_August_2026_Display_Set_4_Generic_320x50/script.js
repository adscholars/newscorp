function initAnimation() {
    const tl = gsap.timeline({ repeat: 0, repeatDelay: 2.5 });
    tl

   .set(".copy", { x: -20 })
   .set("#router", { x: 20 })
   .set(".tick", { y: 5 })
   .set("#cta", { scale: 0, transformOrigin: "205px 25px" })

   //frame1
    .to("#mainContainer", 0, { opacity: 1, ease: Power1.easeIn }, 0)
    .to('#copy1', 0.5, { opacity: 1, x: 0, y: 0, ease: "back.out(1.5)"}, 0.5)
    .to('#copy2, #router', 0.5, { opacity: 1, x: 0, y: 0, ease: "back.out(1.5)"}, 1)

    //frame 2
    .to('.copy, #router', 0.5, { opacity: 0, x: 20, y: 0, stagger: 0.25, ease: "back.in(1.5)"}, 3)
    .to('#logo2', 0.5, { opacity: 1, x: 1, y: 0, stagger: 0.25, ease: "back.in(1.5)"}, 3.8)
    .to('.tick', 0.5, { opacity: 1, x: 0, y: 0, stagger: 0.25, ease: "back.out(1.5)"}, 4.3)
    .to('#cta', 1, { opacity: 1, x: 0, y: 0, scale: 1, ease: "elastic.out(1,0.5)"}, 4.8)

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