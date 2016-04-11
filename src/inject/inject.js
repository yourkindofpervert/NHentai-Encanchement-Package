chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);
            $('#navbar').find('ul.nav.navbar-nav.navbar-right').append($('<li><a id="nhep-button" href="#"><i class="fa fa-gear"></i></a></li>'));
            $("nav").append($('<div class="container-fluid" id="nhep-bar" style="display:none"></div>'));
            // TODO: Not depend on XHR load
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState == 4 && req.status == 200) {
                    main(JSON.parse(req.responseText));
                }
            };
            req.open("GET", chrome.extension.getURL("src/tags.json"));
            req.send();
        }
    }, 10);
});
function getTagCategory(t, d) {
    return t['k'][t["t"][d][0]] || -1;
}
function getTagName(t, d) {
    return t['t'][d][1] || -1;
}
function getTagId(t, n) {
    for (var d in t['t']) {
        if (t['t'].hasOwnProperty(d)) {
            if (n == t['t'][d][1]) {
                return d;
            }
        }
    }
    return -1;
}
/**
 * @param {object} tags
 */
function main(tags) {
    var page_tags = {};
    var $body = $("body");
    var $nhep_button = $("#nhep-button");
    var $nhep_bar = $("#nhep-bar");
    
    $nhep_button.on({
        click: function (event) {
            console.log(event);
            if ($nhep_bar.children().length == 0) {
                $body.css("cursor", "wait");
                page_tags = buildCurrentPageTags(tags);
                buildNhepBar(page_tags, $nhep_bar);
                $body.css("cursor", "initial");
            }
            $nhep_bar.toggle();
        }
    });

    $(document).on({
        click: function (event) {
            $(this).toggleClass('nhep-tag-selected');
        }
    }, '.nhep-tag');

    $(document).on({
        click: function (event) {
            var temp = $('.nhep-tag-selected');
            var selected_tag_ids = [];
            for (var i = 0; i < temp.length; i++) {
                selected_tag_ids.push(getTagId(tags, temp[i].innerText));
            }
            var $gallery = $('.gallery');
            $gallery.hide();
            var filter_type = $('#nhep-filter-type').val();
            for (i = 0; i < $gallery.length; i++) {
                var item_tags = $gallery[i].dataset['tags'].split(" ");
                // AND filter (default)
                if (filter_type == "and") {
                    if (array_intersect(item_tags, selected_tag_ids).length == selected_tag_ids.length) {
                        $($gallery[i]).show();
                    }
                } else if (filter_type == "or") { // OR filter
                    if (array_intersect(item_tags, selected_tag_ids).length > 0) {
                        $($gallery[i]).show();
                    }
                }
            }
        }
    }, '#nhep-filter-button');

    $(document).on({
        click: function (event) {
            $('.gallery').show();
            $('.nhep-tag-selected').toggleClass('nhep-tag-selected');
        }
    }, '#nhep-filter-button-clear');
}

function buildCurrentPageTags(tags) {
    var page_tags = {};
    $.each($('[data-tags]'), function (index, object) {
        $.each(object.dataset['tags'].split(" "), function (i, o) {
            var key = "" + o;
            if (tags["t"].hasOwnProperty(key)) {
                page_tags[key] = {
                    name: getTagName(tags, key),
                    category: getTagCategory(tags, key)
                };
            }
        });
    });
    return page_tags;
}

function buildNhepBar(page_tags, $nhep_bar) {
    $nhep_bar.append($('<div class="row"><ul class="nav navbar-nav navbar-left"><li><button class="btn btn-default btn-md" id="nhep-filter-button"><i class="fa fa-filter"></i> Filter</button></li><li><button class="btn btn-default btn-md" id="nhep-filter-button-clear"><i class="fa fa-cross"></i> Clear Filter </button></li><li><select class="form-control" id="nhep-filter-type"><option value="and">AND</option><option value="or">OR</option></select></li></ul></div><div class="row"><div class="field-name" id="nhep-bar-tags">Tags:</div></div><div class="row"><div class="field-name" id="nhep-bar-artists">Artists:</div></div><div class="row"><div class="field-name" id="nhep-bar-languages">Languages:</div></div><div class="row"><div class="field-name" id="nhep-bar-groups">Groups:</div></div><div class="row"><div class="field-name" id="nhep-bar-parodies">Parodies:</div></div>'));
    $.each(page_tags, function (key, object) {
        $nhep_bar.find("#nhep-bar-" + object.category).append($('<a class="tag nhep-tag">' + object.name + '</a>'));
    });
}

function array_intersect() {
    var a, b, c, d, e, f, g = [], h = {}, i;
    i = arguments.length - 1;
    d = arguments[0].length;
    c = 0;
    for (a = 0; a <= i; a++) {
        e = arguments[a].length;
        if (e < d) {
            c = a;
            d = e
        }
    }
    for (a = 0; a <= i; a++) {
        e = a === c ? 0 : a || c;
        f = arguments[e].length;
        for (var j = 0; j < f; j++) {
            var k = arguments[e][j];
            if (h[k] === a - 1) {
                if (a === i) {
                    g.push(k);
                    h[k] = 0
                } else {
                    h[k] = a
                }
            } else if (a === 0) {
                h[k] = 0
            }
        }
    }
    return g
}
