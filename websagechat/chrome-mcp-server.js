#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import puppeteer from 'puppeteer';

class ChromeMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'chrome-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.browser = null;
    this.page = null;
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.cleanup();
      process.exit(0);
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'chrome_launch',
            description: '크롬 브라우저를 실행합니다',
            inputSchema: {
              type: 'object',
              properties: {
                headless: {
                  type: 'boolean',
                  description: '헤드리스 모드로 실행할지 여부 (기본값: false)',
                  default: false
                },
                url: {
                  type: 'string',
                  description: '처음에 열 URL (선택사항)'
                }
              },
              required: []
            }
          },
          {
            name: 'chrome_navigate',
            description: '현재 탭에서 특정 URL로 이동합니다',
            inputSchema: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: '이동할 URL'
                }
              },
              required: ['url']
            }
          },
          {
            name: 'chrome_screenshot',
            description: '현재 페이지의 스크린샷을 찍습니다',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '스크린샷을 저장할 경로 (선택사항)',
                  default: 'screenshot.png'
                },
                fullPage: {
                  type: 'boolean',
                  description: '전체 페이지 스크린샷 여부 (기본값: false)',
                  default: false
                }
              },
              required: []
            }
          },
          {
            name: 'chrome_get_title',
            description: '현재 페이지의 제목을 가져옵니다',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'chrome_get_url',
            description: '현재 페이지의 URL을 가져옵니다',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          },
          {
            name: 'chrome_click',
            description: '지정된 선택자의 요소를 클릭합니다',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: '클릭할 요소의 CSS 선택자'
                }
              },
              required: ['selector']
            }
          },
          {
            name: 'chrome_type',
            description: '지정된 선택자의 입력 필드에 텍스트를 입력합니다',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: '입력할 요소의 CSS 선택자'
                },
                text: {
                  type: 'string',
                  description: '입력할 텍스트'
                }
              },
              required: ['selector', 'text']
            }
          },
          {
            name: 'chrome_get_text',
            description: '지정된 선택자의 요소에서 텍스트를 가져옵니다',
            inputSchema: {
              type: 'object',
              properties: {
                selector: {
                  type: 'string',
                  description: '텍스트를 가져올 요소의 CSS 선택자'
                }
              },
              required: ['selector']
            }
          },
          {
            name: 'chrome_evaluate',
            description: '페이지에서 JavaScript 코드를 실행합니다',
            inputSchema: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: '실행할 JavaScript 코드'
                }
              },
              required: ['code']
            }
          },
          {
            name: 'chrome_close',
            description: '크롬 브라우저를 종료합니다',
            inputSchema: {
              type: 'object',
              properties: {},
              required: []
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'chrome_launch':
            return await this.launchChrome(args);
          case 'chrome_navigate':
            return await this.navigate(args);
          case 'chrome_screenshot':
            return await this.screenshot(args);
          case 'chrome_get_title':
            return await this.getTitle();
          case 'chrome_get_url':
            return await this.getUrl();
          case 'chrome_click':
            return await this.click(args);
          case 'chrome_type':
            return await this.type(args);
          case 'chrome_get_text':
            return await this.getText(args);
          case 'chrome_evaluate':
            return await this.evaluate(args);
          case 'chrome_close':
            return await this.close();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async launchChrome(args = {}) {
    const { headless = false, url } = args;
    
    this.browser = await puppeteer.launch({
      headless: headless,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    if (url) {
      await this.page.goto(url);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `크롬 브라우저가 실행되었습니다. ${url ? `URL: ${url}` : ''}`
        }
      ]
    };
  }

  async navigate(args) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const { url } = args;
    await this.page.goto(url);
    
    return {
      content: [
        {
          type: 'text',
          text: `${url}로 이동했습니다.`
        }
      ]
    };
  }

  async screenshot(args = {}) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const { path = 'screenshot.png', fullPage = false } = args;
    
    await this.page.screenshot({ 
      path: path, 
      fullPage: fullPage 
    });
    
    return {
      content: [
        {
          type: 'text',
          text: `스크린샷이 ${path}에 저장되었습니다.`
        }
      ]
    };
  }

  async getTitle() {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const title = await this.page.title();
    
    return {
      content: [
        {
          type: 'text',
          text: `페이지 제목: ${title}`
        }
      ]
    };
  }

  async getUrl() {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const url = this.page.url();
    
    return {
      content: [
        {
          type: 'text',
          text: `현재 URL: ${url}`
        }
      ]
    };
  }

  async click(args) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const { selector } = args;
    await this.page.click(selector);
    
    return {
      content: [
        {
          type: 'text',
          text: `${selector} 요소를 클릭했습니다.`
        }
      ]
    };
  }

  async type(args) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const { selector, text } = args;
    await this.page.type(selector, text);
    
    return {
      content: [
        {
          type: 'text',
          text: `${selector} 요소에 "${text}"를 입력했습니다.`
        }
      ]
    };
  }

  async getText(args) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const { selector } = args;
    const text = await this.page.$eval(selector, (element) => element.textContent);
    
    return {
      content: [
        {
          type: 'text',
          text: `${selector} 요소의 텍스트: ${text}`
        }
      ]
    };
  }

  async evaluate(args) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다. chrome_launch를 먼저 실행하세요.');
    }
    
    const { code } = args;
    const result = await this.page.evaluate(code);
    
    return {
      content: [
        {
          type: 'text',
          text: `JavaScript 실행 결과: ${JSON.stringify(result)}`
        }
      ]
    };
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    
    return {
      content: [
        {
          type: 'text',
          text: '크롬 브라우저를 종료했습니다.'
        }
      ]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Chrome MCP Server running on stdio');
  }
}

const server = new ChromeMCPServer();
server.run().catch(console.error);


