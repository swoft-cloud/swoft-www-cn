$.get("https://api.github.com/repos/swoft-cloud/swoft-case/contents/case.json", function (data) {
    let obj = JSON.parse(decodeURIComponent(escape(atob(data.content))))
    let ele = $('#case #logos')
    obj.forEach(element => {
        let logo = '<a href="' + element.siteUrl + '" target="_blank" title="' + element.name + '"><img src="' + element.logoUrl + '" alt="logo" /></a>'
        ele.append(logo)
    });
})