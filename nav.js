// 用户数据（实际项目中应该从服务器获取）
const users = {
  'admin': { password: 'admin123', role: 'admin', name: '管理员' },
  'developer': { password: 'dev123', role: 'developer', name: '开发人员' },
  'tester': { password: 'test123', role: 'tester', name: '测试人员' },
  'designer': { password: 'design123', role: 'designer', name: '设计师' },
  'manager': { password: 'manager123', role: 'manager', name: '项目经理' },
  'devops': { password: 'devops123', role: 'devops', name: '运维人员' }
};

let currentUser = null;

// 登录功能
function initLogin() {
  const loginBtn = document.getElementById('loginBtn');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const logoutBtn = document.getElementById('logoutBtn');

  loginBtn.onclick = function() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
      alert('请输入用户名和密码');
      return;
    }
    
    if (users[username] && users[username].password === password) {
      currentUser = {
        username: username,
        role: users[username].role,
        name: users[username].name
      };
      
      // 保存登录状态
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
      // 显示主内容
      showMainContent();
      
      // 清空输入框
      usernameInput.value = '';
      passwordInput.value = '';
    } else {
      alert('用户名或密码错误');
    }
  };

  // 回车登录
  passwordInput.onkeyup = function(e) {
    if (e.key === 'Enter') {
      loginBtn.click();
    }
  };

  // 退出登录
  logoutBtn.onclick = function() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginForm();
  };
}

// 显示登录表单
function showLoginForm() {
  document.getElementById('loginSection').style.display = 'flex';
  document.getElementById('mainContent').style.display = 'none';
}

// 显示主内容
function showMainContent() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('mainContent').style.display = 'block';
  
  // 显示用户信息
  document.getElementById('currentUser').textContent = `欢迎，${currentUser.name}`;
  
  // 加载导航内容
  loadNavigation();
}

// 检查用户权限
function hasPermission(item) {
  if (!item.visibleTo) return true; // 没有权限限制则所有人都可见
  return item.visibleTo.includes(currentUser.role);
}

// 加载导航内容
function loadNavigation() {
  fetch('config.json')
    .then(res => res.json())
    .then(data => {
      const root = document.getElementById('nav-root');
      const categoryTabs = document.getElementById('categoryTabs');
      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.getElementById('searchBtn');
      
      // 清空现有内容
      root.innerHTML = '';
      categoryTabs.innerHTML = '';
      
      // 过滤有权限的导航项
      const filteredData = data.map(group => ({
        ...group,
        items: group.items.filter(hasPermission)
      })).filter(group => group.items.length > 0); // 只保留有可见项目的分组
      
      // 生成类别标签
      const allTab = document.createElement('button');
      allTab.className = 'category-tab active';
      allTab.textContent = '全部';
      allTab.onclick = () => filterByCategory('all');
      categoryTabs.appendChild(allTab);
      
      filteredData.forEach(group => {
        const tab = document.createElement('button');
        tab.className = 'category-tab';
        tab.textContent = group.group;
        tab.onclick = () => filterByCategory(group.group);
        categoryTabs.appendChild(tab);
      });
      
      // 渲染导航
      renderNav(filteredData);
      
      // 筛选功能
      function filterByCategory(category) {
        document.querySelectorAll('.category-tab').forEach(tab => {
          tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        const containers = document.querySelectorAll('.container');
        containers.forEach(container => {
          const header = container.querySelector('.container-header');
          if (category === 'all' || header.textContent === category) {
            container.classList.remove('hidden');
          } else {
            container.classList.add('hidden');
          }
        });
      }
      
      // 搜索功能
      function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (!searchTerm) {
          document.querySelectorAll('.item-block').forEach(block => {
            block.classList.remove('hidden');
          });
          return;
        }
        
        document.querySelectorAll('.item-block').forEach(block => {
          const title = block.querySelector('.title').textContent.toLowerCase();
          const notice = block.querySelector('.notice').textContent.toLowerCase();
          
          if (title.includes(searchTerm) || notice.includes(searchTerm)) {
            block.classList.remove('hidden');
          } else {
            block.classList.add('hidden');
          }
        });
      }
      
      // 绑定搜索事件
      searchBtn.onclick = performSearch;
      searchInput.onkeyup = (e) => {
        if (e.key === 'Enter') {
          performSearch();
        }
      };
      
      function renderNav(data) {
        data.forEach(group => {
          const container = document.createElement('div');
          container.className = 'container';
          const header = document.createElement('div');
          header.className = 'container-header';
          
          // 添加折叠图标
          const collapseIcon = document.createElement('span');
          collapseIcon.className = 'collapse-icon';
          collapseIcon.innerHTML = '▼';
          header.appendChild(collapseIcon);
          
          header.textContent = group.group;
          container.appendChild(header);
          const body = document.createElement('div');
          body.className = 'container-body';
          
          group.items.forEach(item => {
            const block = document.createElement('div');
            block.className = 'item-block';
            
            // 如果有用户名密码，添加特殊样式类
            if (item.username || item.password) {
              block.classList.add('has-credentials');
            }
            
            const mainA = document.createElement('a');
            mainA.href = item.mainLink;
            mainA.target = '_blank';
            const top = document.createElement('div');
            top.className = 'item-top';
            const logo = document.createElement('div');
            logo.className = 'item-logo';
            const img = document.createElement('img');
            
            // 支持base64格式的logo
            if (item.logo.startsWith('data:image/') || item.logo.startsWith('data:image/')) {
              img.src = item.logo; // 直接使用base64数据
            } else {
              img.src = item.logo; // 使用文件路径
            }
            
            logo.appendChild(img);
            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'item-body';
            const title = document.createElement('span');
            title.className = 'title';
            title.textContent = item.title;
            const notice = document.createElement('span');
            notice.className = 'notice';
            notice.textContent = item.notice;
            bodyDiv.appendChild(title);
            bodyDiv.appendChild(notice);
            top.appendChild(logo);
            top.appendChild(bodyDiv);
            mainA.appendChild(top);
            block.appendChild(mainA);
            
            // 底部链接
            if (item.links && item.links.length > 0) {
              const bottom = document.createElement('div');
              bottom.className = 'item-bottom';
              item.links.forEach((link, idx) => {
                if (idx > 0) {
                  const divider = document.createElement('div');
                  divider.className = 'divider';
                  bottom.appendChild(divider);
                }
                const a = document.createElement('a');
                a.href = link.url;
                a.target = '_blank';
                const div = document.createElement('div');
                div.textContent = link.label;
                a.appendChild(div);
                bottom.appendChild(a);
              });
              block.appendChild(bottom);
            }
            
            // 用户名密码显示（点击后展开）
            if (item.username || item.password) {
              const up = document.createElement('div');
              up.className = 'item-cred';
              // 初始只显示按钮
              const showBtn = document.createElement('button');
              showBtn.className = 'show-cred-btn';
              showBtn.textContent = '显示用户名密码';
              up.appendChild(showBtn);
              let shown = false;
              showBtn.onclick = function(e) {
                if (shown) return;
                shown = true;
                showBtn.style.display = 'none';
                let credHtml = '';
                if (item.username) {
                  credHtml += `<span>用户名：<b class='copyable' data-copy='${item.username}'>${item.username}</b><button class='copy-btn' data-copy='${item.username}' title='复制'>复制</button></span>`;
                }
                if (item.password) {
                  credHtml += `&nbsp;&nbsp;密码：<b class='copyable' data-copy='${item.password}'>${item.password}</b><button class='copy-btn' data-copy='${item.password}' title='复制'>复制</button>`;
                }
                const credDiv = document.createElement('div');
                credDiv.innerHTML = credHtml;
                credDiv.style.display = 'flex';
                credDiv.style.alignItems = 'center';
                credDiv.style.gap = '10px';
                up.appendChild(credDiv);
                // 复制功能
                setTimeout(() => {
                  credDiv.querySelectorAll('.copy-btn').forEach(btn => {
                    btn.onclick = function(e) {
                      const val = btn.getAttribute('data-copy');
                      if (val) {
                        navigator.clipboard.writeText(val);
                        btn.textContent = '已复制';
                        setTimeout(() => { btn.textContent = '复制'; }, 1200);
                      }
                      e.stopPropagation();
                    };
                  });
                }, 100);
              };
              block.appendChild(up);
            }
            body.appendChild(block);
          });
          container.appendChild(body);
          root.appendChild(container);
          
          // 添加折叠功能
          header.onclick = function() {
            const isCollapsed = body.classList.contains('collapsed');
            if (isCollapsed) {
              body.classList.remove('collapsed');
              header.classList.remove('collapsed');
            } else {
              body.classList.add('collapsed');
              header.classList.add('collapsed');
            }
          };
        });
      }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否已登录
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showMainContent();
  } else {
    showLoginForm();
  }
  
  // 初始化登录功能
  initLogin();
});

// 在 style 末尾追加 .item-cred、.copy-btn、.copyable、.show-cred-btn 样式
const style = document.createElement('style');
style.innerHTML = `
.item-cred {
  font-size: 12px;
  color: #d14500;
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8d6 100%);
  border-radius: 0 0 10px 10px;
  padding: 8px 16px 10px 16px;
  margin-top: -2px;
  border-top: 1px solid #ffd4b3;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.item-cred::before {
  content: '🔐';
  font-size: 14px;
  margin-right: 4px;
}
.copy-btn {
  margin-left: 4px;
  padding: 2px 8px;
  font-size: 11px;
  border: none;
  border-radius: 12px;
  background: #ff6b35;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}
.copy-btn:hover {
  background: #e55a2b;
  transform: scale(1.05);
}
.copyable {
  user-select: all;
  font-weight: 600;
  color: #d14500;
}
.show-cred-btn {
  padding: 4px 12px;
  font-size: 12px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(255, 107, 53, 0.2);
}
.show-cred-btn:hover {
  background: linear-gradient(135deg, #e55a2b 0%, #ff7a35 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 107, 53, 0.3);
}
`;
document.head.appendChild(style);