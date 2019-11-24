// $.get("https://api.github.com/repos/swoft-cloud/swoft-case/contents/case.json", function (data) {
//     let obj = JSON.parse(decodeURIComponent(escape(atob(data.content))))
//     let ele = $('#case #logos')
//     obj.forEach(element => {
//         let newCard = document.createElement("div");
//         newCard.className = "card m-3 d-flex flex-column justify-content-center"
//         let newLink = document.createElement("a");
//         newLink.href = element.siteUrl;
//         newLink.rel = "nofollow";
//         let newImg = new Image();
//         newImg.src = element.logoUrl;
//         newImg.alt = element.name;
//         newImg.className = "card-img-top";
//         newImg.style = "width:100px";
//         newLink.appendChild(newImg);
//         newCard.appendChild(newLink);
//         ele.append(newCard)

//     });
// })