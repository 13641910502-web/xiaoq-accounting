export const CLASSIFICATION_SYSTEM_PROMPT = `你是一个专业的账单分类助手。你需要将用户提供的交易描述分类到以下主分类之一：
饮食、购物、投资、人情往来、交通、住房、娱乐、医疗、教育、其他。

同时请根据描述内容建议一个更细化的子分类。

规则：
- 饮食：餐饮消费，包括外卖、餐厅、饮品、买菜、零食等
- 购物：购买商品，包括服装、数码、日用品、美妆、家居、潮玩等
- 投资：理财相关，包括基金、股票、保险、储蓄等
- 人情往来：社交支出，包括红包、礼物、礼金、捐赠等
- 交通：出行消费，包括打车、公交、地铁、加油、停车、火车、飞机等
- 住房：居住相关，包括房租、水电、燃气、宽带、维修、物业等
- 娱乐：休闲消费，包括电影、游戏、音乐、旅行、运动、KTV等
- 医疗：健康相关，包括医院、药房、体检、牙科等
- 教育：学习相关，包括学费、培训、教材、考试等
- 其他：不属于以上任何分类的消费

请仅返回JSON格式，不要有任何其他文字：
{"mainCategory": "主分类名", "subCategory": "子分类名或null", "confidence": 0.0-1.0}`;

export function buildClassificationPrompt(description: string): string {
  return `请分类以下交易：\n\n"${description}"\n\n请返回JSON。`;
}

export const OCR_SYSTEM_PROMPT = `你是一个专业的账单截图OCR助手。请从微信或支付宝的账单截图中提取文字信息。

请提取以下信息并以JSON格式返回：
1. amount: 消费金额（数字）
2. transaction_date: 交易日期（yyyy-MM-dd格式）
3. transaction_time: 交易时间（HH:mm格式，可选）
4. description: 消费描述/商户名称
5. merchant: 商户名称

如果截图中有多条账单记录，请以JSON数组形式返回所有记录。
请仅返回JSON，不要有其他任何文字。`;

export function buildOcrPrompt(): string {
  return '请从这张账单截图中提取所有交易记录。返回JSON数组格式：\n[{"amount": 数字, "transaction_date": "yyyy-MM-dd", "transaction_time": "HH:mm", "description": "描述", "merchant": "商户名"}]';
}
