// ==UserScript==
// @name         豆瓣小组高亮关键字
// @version      0.1
// @license      MIT
// @namespace    https://tcatche.github.io/
// @description  豆瓣小组,高亮指定关键字，排除指定关键字
// @author       tcatche
// @match        https://www.douban.com/group/*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @homepageURL  https://github.com/tcatche/douban-group-filter
// @supportURL   https://github.com/tcatche/douban-group-filter/issues
// @downloadURL  https://github.com/tcatche/douban-group-filter/blob/master/index.js
// @updateURL    https://github.com/tcatche/douban-group-filter/blob/master/index.js
// @grant        none
// ==/UserScript==
(function() {
  // save user config
  const saveConfig = config => {
    const configString = JSON.stringify(config);
    localStorage.setItem('douban_group_filter_config', configString);
  }

  // load user config
  const getConfig = () => {
    const configString = localStorage.getItem('douban_group_filter_config');
    try {
      const config = JSON.parse(configString);
      return config;
    } catch (e) {
      return {};
    }
  }

  // run user filters
  const runFilter = (config) => {
    $('.topics tr .td-subject a, .title a').each(function() {
      var $this = $(this);
      var title = $this.attr('title');
      console.log(title);
      var isInInclude = title => (config.include || []).filter(v => !!v).find(keyword => title.indexOf(keyword) >= 0);
      var isInDeclude = title => (config.declude || []).filter(v => !!v).find(keyword => title.indexOf(keyword) >= 0);
      const isTitleInInclude = isInInclude(title);
      const isTitleInDeclude = isInDeclude(title);
      if (isTitleInInclude && !isTitleInDeclude) {
        $this.css({background: 'green', color: '#fff'});
      }
      if (isInDeclude(title)) {
        $this.parents('tr').hide();
      }
    });
  }

  // init config dom
  let configDivHtml = `
    <div id="douban_group_filter_container" class="douban_group_filter">
      <style>
        .douban_group_filter {
          width: 100vw; height: 100vh; position: absolute; top: 0; left: 0;
          display:none;
        }
        .douban_group_filter_mask {
          position: absolute; background: rgba(0,0,0,.6); width: 100%; height: 100%;
        }
        .douban_group_filter_inner {
          width: 400px; text-align: center; margin: auto; top: 100px; position: relative; background: #fff; padding: 30px;
        }
        textarea {
          width: 100%;
        }
        .douban_group_filter_button {
          color: #ca6445; padding: 5px 10px; font-size: 13px; border: 1px solid #f8dcc3; background: #fae9da; font-weight: normal; cursor: pointer;
        }
      </style>
      <div class="douban_group_filter_mask"></div>
      <div class="douban_group_filter_inner">
        <textarea rows="5" placeholder="请填入要高亮的关键字，多个关键字用空格隔开"></textarea>
        <textarea rows="5" placeholder="请填入要排除的关键字，多个关键字用空格隔开 "></textarea>
        <button id="douban_group_filter_sure" class="douban_group_filter_button">确定</button>
        <button id="douban_group_filter_cancel" class="douban_group_filter_button" >取消</button>
      </div>
    </textarea>
  `;
  $(document.body).append(configDivHtml);


  const titleEles = $('h1');
  if (titleEles && titleEles[0]) {
    $(titleEles[0]).append('<span id="douban_group_filter_config" class="douban_group_filter_button">小组过滤设置</span>');
  }

  const $contain = $('#douban_group_filter_container');
  // bind events
  $('#douban_group_filter_config').click(e => {
    $contain.show();
  });
  $('#douban_group_filter_sure').click(e => {
    const config = {
      include: $('#douban_group_filter_container textarea')[0].value.split(' '),
      declude: $('#douban_group_filter_container textarea')[1].value.split(' '),
    }
    saveConfig(config)
    runFilter(config);
    $contain.hide();
  });
  $('#douban_group_filter_cancel').click(e => {
    $contain.hide();
  });

  // init values
  const config = getConfig();
  $('#douban_group_filter_container textarea')[0].value = config.include.join(' ');
  $('#douban_group_filter_container textarea')[1].value = config.declude.join(' ');
  runFilter(config);
})();