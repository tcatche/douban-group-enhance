// ==UserScript==
// @name         豆瓣小组功能增强
// @version      0.1.1
// @license      MIT
// @namespace    https://tcatche.github.io/
// @description  豆瓣小组展示功能增强：高亮包含指定关键字的帖子；隐藏包含指定关键字的帖子；去除标题省略号，展示全部文本；新标签页打开帖子
// @author       tcatche
// @match        https://www.douban.com/group/*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @homepageURL  https://github.com/tcatche/douban-group-enhance
// @supportURL   https://github.com/tcatche/douban-group-enhance/issues
// @downloadURL  https://github.com/tcatche/douban-group-enhance/blob/master/index.js
// @updateURL    https://github.com/tcatche/douban-group-enhance/blob/master/index.js
// @grant        none
// ==/UserScript==
(function() {
  // save user config
  const saveConfig = config => {
    const configString = JSON.stringify(config);
    localStorage.setItem('douban_group_enhance_config', configString);
  }

  // load user config
  const getConfig = () => {
    const configString = localStorage.getItem('douban_group_enhance_config');
    const odlConfigString = localStorage.getItem('douban_group_filter_config');
    try {
      const config = JSON.parse(configString || odlConfigString);
      return config;
    } catch (e) {
      return {};
    }
  }

  // run user filters
  const runFilter = (config, self) => {
    const title = self.attr('title') || '';
    const isInInclude = title => (config.include || []).filter(v => !!v).find(keyword => title.indexOf(keyword) >= 0);
    const isInDeclude = title => (config.declude || []).filter(v => !!v).find(keyword => title.indexOf(keyword) >= 0);
    const isTitleInInclude = isInInclude(title);
    const isTitleInDeclude = isInDeclude(title);
    if (isTitleInInclude && !isTitleInDeclude) {
      self.css({background: 'green', color: '#fff'});
    }
    if (isInDeclude(title)) {
      self.parents('tr').hide();
    }
  }

  // open in new tab
  const runOpenInNewTab = (config, self) => {
    if (config.openInNewTab) {
      self.attr('target', '_blank');
    }
  }

  // show full title without cliped!
  const runShowFullTitle = (config, self) => {
    if (config.showFullTitle) {
      const title = self.attr('title') || self.text();
      self.text(title);
    }
  }

  // show reply number
  const runShowReplyNumber = (options, self, index) => {
    if (options.config.showReplyNumber) {
      const replyHead = self.find('h4')[0];
      const isInserted = $(replyHead).find('.douban_group_enhance_replay_number').length > 0;
      if (!isInserted) {
        const start = +(options.params.start || 0);
        const replayNumber = start + 1 + index;
        $(replyHead).append('<span class="douban_group_enhance_replay_tag douban_group_enhance_replay_number">' + replayNumber +'楼</span>');
      }
    }
  }

  // show if is topic owner 
  const runShowOwnerTag = (options, self) => {
    if (options.config.showOwnerTag) {
      const replyHead = self.find('h4')[0];
      const isInserted = $(replyHead).find('.douban_group_enhance_owner_tag').length > 0;
      if (!isInserted) {
        const replyerName = self.find('h4 a').text().trim();
        if (replyerName === options.topicUser) {
          $(replyHead).append('<span class="douban_group_enhance_replay_tag douban_group_enhance_owner_tag">楼主</span>');
        }
      }
    }
  }

  const runEnhancer = config => {
    const isTopicDetailPage = location.pathname.indexOf('/group/topic/') >= 0;
    const search = location.search  ? location.search.substr(1) : '';
    const params = {};
    search.split('&').filter(v => !!v).map(item => {
      const items = item.split('=');
      if (items.length >= 1) {
        params[items[0]] = items[1];
      }
    });
    const global = {
      config: config,
      params: params,
    };

    if (isTopicDetailPage) {
      // 帖子内容
      $('#comments li').each(function(index) {
        global.topicUser = $('.topic-doc .from > a').text().trim();
        const $this = $(this);
        runShowReplyNumber(global, $this, index);
        runShowOwnerTag(global, $this);
      });
    } else {
      // 帖子列表
      $('.topics tr .td-subject a, .title a').each(function() {
        const $this = $(this);
        runFilter(config, $this);
        runOpenInNewTab(config, $this);
        runShowFullTitle(config, $this);
      });
    }
  }
  // init config dom
  let configDivHtml = `
    <div id="douban_group_enhance_container" class="douban_group_enhance">
      <style>
        .douban_group_enhance_config {
          color: #ca6445;
          padding: 5px 20px;
          font-size: 13px;
          background: #fae9da;
          font-weight: normal;
          cursor: pointer;
        }
        .douban_group_enhance {
          width: 100vw;
          height: 100vh;
          position: absolute;
          top: 0;
          left: 0;
          display:none;
        }
        .douban_group_enhance_mask {
          position: absolute;
          background: rgba(0,0,0,.6);
          width: 100%;
          height: 100%;
        }
        .douban_group_enhance_inner {
          width: 500px;
          text-align: center;
          margin: auto;
          top: 100px;
          position: relative;
          background: #fff;
          padding: 30px;
          height: 300px;
          overflow: auto;
        }
        .douban_group_enhance_replay_tag {
          float: right;
          color: #333;
          padding: 0 10px;
        }
        .douban_group_enhance_inner_content {
          text-align: left;
        }
        .douban_group_enhance_inner textarea {
          width: 100%;
          height: 60px;
          resize: auto;
          resize: vertical;
          min-height: 50px;
          padding: 10px;
        }
        .douban_group_enhance_inner textarea:focus {
          border: 1px solid #072;
          box-shadow: 0px 0px 1px 0px #072;
        }
        .douban_group_enhance_buttons {
          float: right;
        }
        .douban_group_enhance_button {
          color: #ca6445;
          padding: 5px 20px;
          font-size: 13px;
          border: 1px solid #f8dcc3;
          background: #fae9da;
          font-weight: normal;
          cursor: pointer;
        }
      </style>
      <div class="douban_group_enhance_mask"></div>
      <div class="douban_group_enhance_inner">
        <div class="douban_group_enhance_inner_content">
          <h2>小组帖子过滤设置</h2>
          <div>请填入要高亮的关键字，多个关键字用空格隔开：</div>
          <textarea placeholder="请填入要高亮的关键字，多个关键字用空格隔开"></textarea>
          <br />
          <div>请填入要排除的关键字，多个关键字用空格隔开：</div>
          <textarea placeholder="请填入要排除的关键字，多个关键字用空格隔开 "></textarea>
          <div><input type="checkbox" id="openInNewTab" value="1">勾选则使用新标签打开帖子</div>
          <div><input type="checkbox" id="showFullTitle" value="1">勾选则去除标题省略号，显示完整标题</div>
          <div><input type="checkbox" id="showReplyNumber" value="1">勾选则显示帖子里回复的楼层号</div>
          <div><input type="checkbox" id="showOwnerTag" value="1">勾选则为楼主添加“楼主”的标签</div>
          <p class="douban_group_enhance_buttons">
            <button id="douban_group_enhance_sure" class="douban_group_enhance_button">确定</button>
            <button id="douban_group_enhance_cancel" class="douban_group_enhance_button" >取消</button>
          </p>
        </div>
      </div>
    </textarea>
  `;
  $(document.body).append(configDivHtml);


  const insertPos = $('#db-global-nav .top-nav-doubanapp');
  if (insertPos && insertPos[0]) {
    $(insertPos[0]).after('<div id="douban_group_enhance_config" class="top-nav-doubanapp"><span class="douban_group_enhance_button">小组增强插件设置</span></div>');
  }

  const $contain = $('#douban_group_enhance_container');
  // bind events
  $('#douban_group_enhance_config').click(e => {
    $contain.show();
  });
  $('#douban_group_enhance_sure').click(e => {
    const config = {
      include: $('#douban_group_enhance_container textarea')[0].value.split(' '),
      declude: $('#douban_group_enhance_container textarea')[1].value.split(' '),
      openInNewTab: $('#openInNewTab')[0].checked,
      showFullTitle: $('#showFullTitle')[0].checked,
      showReplyNumber: $('#showReplyNumber')[0].checked,
      showOwnerTag: $('#showOwnerTag')[0].checked,
    }
    saveConfig(config);
    runEnhancer(config);
    $contain.hide();
  });
  $('#douban_group_enhance_cancel').click(e => {
    $contain.hide();
  });

  // init values
  const config = getConfig();
  $('#douban_group_enhance_container textarea')[0].value = config.include.join(' ');
  $('#douban_group_enhance_container textarea')[1].value = config.declude.join(' ');
  $('#openInNewTab')[0].checked = config.openInNewTab;
  $('#showFullTitle')[0].checked = config.showFullTitle;
  $('#showReplyNumber')[0].checked = config.showReplyNumber;
  $('#showOwnerTag')[0].checked = config.showOwnerTag;
  runEnhancer(config);
})();