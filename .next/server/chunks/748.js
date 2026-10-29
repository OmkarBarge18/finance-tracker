"use strict";exports.id=748,exports.ids=[748],exports.modules={75748:(t,e,a)=>{a.a(t,async(t,n)=>{try{a.d(e,{Am:()=>l,CP:()=>g,IH:()=>C,Ks:()=>L,M7:()=>y,T8:()=>m,Vn:()=>I,_X:()=>S,f1:()=>R,i2:()=>f,k2:()=>O,k4:()=>N,o1:()=>p,sG:()=>_,tm:()=>T,vS:()=>A,z0:()=>h});var o=a(8678),c=t([o]);o=(c.then?(await c)():c)[0];let w=null,$=!1,D=new Map;function i(t){let e=D.get(t);return e&&Date.now()-e.timestamp<6e3?e.data:null}function r(t,e){D.set(t,{data:e,timestamp:Date.now()})}function s(){D.clear()}function u(){return{connectionString:process.env.DATABASE_URL||`postgresql://${process.env.PGUSER||"postgres"}:${encodeURIComponent(process.env.PGPASSWORD||"postgres")}@${process.env.PGHOST||"localhost"}:${process.env.PGPORT||"5432"}/${process.env.PGDATABASE||"finance_tracker"}`,max:15,idleTimeoutMillis:15e3,connectionTimeoutMillis:4e3,allowExitOnIdle:!0}}function d(){return w||(w=new o.Pool(u())).on("error",t=>{console.warn("PostgreSQL idle client notice:",t.message)}),w}function l(t){return w&&(w.end().catch(()=>{}),w=null),t&&(process.env.DATABASE_URL=t),$=!1,s(),d()}let U={accounts:[{id:1,name:"Main Checking",type:"checking",balance:5420.5,currency:"USD",color:"#6366f1"},{id:2,name:"High Yield Savings",type:"savings",balance:18450,currency:"USD",color:"#10b981"},{id:3,name:"Sapphire Credit Card",type:"credit",balance:-1280.4,currency:"USD",color:"#f43f5e"},{id:4,name:"Vanguard Portfolio",type:"investment",balance:32400,currency:"USD",color:"#0ea5e9"}],categories:[{id:1,name:"Food & Dining",type:"expense",colour:"#f97316",icon:"utensils"},{id:2,name:"Transport",type:"expense",colour:"#3b82f6",icon:"car"},{id:3,name:"Housing",type:"expense",colour:"#8b5cf6",icon:"home"},{id:4,name:"Utilities",type:"expense",colour:"#06b6d4",icon:"zap"},{id:5,name:"Healthcare",type:"expense",colour:"#ef4444",icon:"heart-pulse"},{id:6,name:"Entertainment",type:"expense",colour:"#ec4899",icon:"film"},{id:7,name:"Shopping",type:"expense",colour:"#f59e0b",icon:"shopping-bag"},{id:8,name:"Education",type:"expense",colour:"#10b981",icon:"book"},{id:9,name:"Travel",type:"expense",colour:"#6366f1",icon:"plane"},{id:10,name:"Subscriptions",type:"expense",colour:"#14b8a6",icon:"refresh-cw"},{id:11,name:"Salary",type:"income",colour:"#22c55e",icon:"briefcase"},{id:12,name:"Freelance & Bonus",type:"income",colour:"#84cc16",icon:"laptop"},{id:13,name:"Dividends & Yield",type:"income",colour:"#a3e635",icon:"trending-up"}],transactions:[{id:1,account_id:1,category_id:11,amount:4500,type:"income",description:"Monthly Tech Salary",date:"2026-10-01",notes:"Direct deposit"},{id:2,account_id:1,category_id:3,amount:1450,type:"expense",description:"Apartment Rent",date:"2026-10-02"},{id:3,account_id:3,category_id:1,amount:112.5,type:"expense",description:"Whole Foods Grocery",date:"2026-10-05"},{id:4,account_id:3,category_id:6,amount:45,type:"expense",description:"Cinema IMAX Tickets",date:"2026-10-08"},{id:5,account_id:1,category_id:10,amount:19.99,type:"expense",description:"Spotify Family Subscription",date:"2026-10-10"},{id:6,account_id:1,category_id:12,amount:850,type:"income",description:"Web Development Client Work",date:"2026-10-12"},{id:7,account_id:3,category_id:7,amount:189,type:"expense",description:"Ergonomic Desk Accessories",date:"2026-10-14"},{id:8,account_id:1,category_id:4,amount:85.4,type:"expense",description:"High-speed Fiber Internet",date:"2026-10-16"},{id:9,account_id:3,category_id:1,amount:64.2,type:"expense",description:"Artisan Bistro Dinner",date:"2026-10-18"},{id:10,account_id:1,category_id:2,amount:45,type:"expense",description:"Electric Vehicle Charging & Metro Pass",date:"2026-10-19"}],budgets:[{id:1,category_id:1,amount:600,month:"2026-10-01"},{id:2,category_id:2,amount:200,month:"2026-10-01"},{id:3,category_id:3,amount:1500,month:"2026-10-01"},{id:4,category_id:6,amount:250,month:"2026-10-01"},{id:5,category_id:7,amount:350,month:"2026-10-01"}],recurring:[{id:1,name:"Netflix 4K Ultra",amount:22.99,frequency:"monthly",next_due_date:"2026-11-01",status:"active",category_id:10,account_id:3},{id:2,name:"Apartment Lease",amount:1450,frequency:"monthly",next_due_date:"2026-11-01",status:"active",category_id:3,account_id:1},{id:3,name:"Gym & Spa Membership",amount:65,frequency:"monthly",next_due_date:"2026-11-05",status:"active",category_id:5,account_id:1},{id:4,name:"GitHub Copilot & Cloud",amount:19,frequency:"monthly",next_due_date:"2026-11-12",status:"active",category_id:10,account_id:3}]};async function E(){if($)return!0;let t=d();try{let e=await t.connect();try{await e.query("BEGIN"),await e.query(`
        CREATE TABLE IF NOT EXISTS accounts (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          type VARCHAR(20) NOT NULL,
          balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
          currency VARCHAR(3) NOT NULL DEFAULT 'USD',
          color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `),await e.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(50) NOT NULL,
          type VARCHAR(10) NOT NULL,
          colour VARCHAR(7) NOT NULL DEFAULT '#94a3b8',
          icon VARCHAR(30)
        );
      `),await e.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          amount NUMERIC(14, 2) NOT NULL,
          type VARCHAR(10) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `),await e.query(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date_id ON transactions(date DESC, id DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_acc_date ON transactions(account_id, date DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_cat_date ON transactions(category_id, date DESC);
        CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date DESC);
      `),await e.query(`
        CREATE TABLE IF NOT EXISTS budgets (
          id SERIAL PRIMARY KEY,
          category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          amount NUMERIC(14, 2) NOT NULL,
          month DATE NOT NULL,
          CONSTRAINT uq_budget_category_month UNIQUE (category_id, month)
        );
        CREATE INDEX IF NOT EXISTS idx_budgets_month_cat ON budgets(month, category_id);
      `),await e.query(`
        CREATE TABLE IF NOT EXISTS recurring_bills (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          amount NUMERIC(14, 2) NOT NULL,
          category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
          account_id INTEGER REFERENCES accounts(id) ON DELETE SET NULL,
          frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
          next_due_date DATE NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'active'
        );
        CREATE INDEX IF NOT EXISTS idx_recurring_due ON recurring_bills(next_due_date);
      `),await e.query(`
        CREATE TABLE IF NOT EXISTS savings_goals (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          target_amount NUMERIC(14, 2) NOT NULL,
          current_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
          target_date DATE NOT NULL,
          color VARCHAR(7) NOT NULL DEFAULT '#10b981',
          icon VARCHAR(30) DEFAULT 'target'
        );
      `);let t=await e.query("SELECT COUNT(*) FROM categories");if(0===parseInt(t.rows[0].count)){for(let t of U.categories)await e.query("INSERT INTO categories (id, name, type, colour, icon) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING",[t.id,t.name,t.type,t.colour,t.icon]);await e.query("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));")}let a=await e.query("SELECT COUNT(*) FROM accounts");if(0===parseInt(a.rows[0].count)){for(let t of U.accounts)await e.query("INSERT INTO accounts (id, name, type, balance, currency, color) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",[t.id,t.name,t.type,t.balance,t.currency,t.color]);await e.query("SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));")}let n=await e.query("SELECT COUNT(*) FROM transactions");if(0===parseInt(n.rows[0].count)){for(let t of U.transactions)await e.query("INSERT INTO transactions (id, account_id, category_id, amount, type, description, date, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT DO NOTHING",[t.id,t.account_id,t.category_id,t.amount,t.type,t.description,t.date,t.notes||null]);await e.query("SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));")}return await e.query("COMMIT"),$=!0,!0}catch(t){throw await e.query("ROLLBACK"),t}finally{e.release()}}catch(t){return!1}}async function y(t){let e=null;try{e=new o.Pool({connectionString:t||u().connectionString,connectionTimeoutMillis:2500});let a=await e.connect(),n=await a.query("SELECT version(), current_database() as db");return a.release(),await e.end(),{connected:!0,message:"Successfully connected to PostgreSQL!",database:n.rows[0]?.db,version:n.rows[0]?.version?.split(" ")?.[1]||"18"}}catch(t){return e&&await e.end().catch(()=>{}),{connected:!1,message:t.message||"Failed to connect to PostgreSQL"}}}async function m(){let t="accounts_all",e=i(t);if(e)return e;try{if(await E()){let e=d(),a=(await e.query("SELECT * FROM accounts ORDER BY id ASC")).rows.map(t=>({...t,balance:parseFloat(t.balance)}));return r(t,a),a}}catch(t){}return r(t,U.accounts),U.accounts}async function p(t){s();try{if(await E()){let e=d(),a=(await e.query("INSERT INTO accounts (name, type, balance, currency, color) VALUES ($1, $2, $3, $4, $5) RETURNING *",[t.name,t.type,t.balance,t.currency||"USD",t.color||"#6366f1"])).rows[0];return{...a,balance:parseFloat(a.balance)}}}catch(t){}let e={...t,id:U.accounts.length?Math.max(...U.accounts.map(t=>t.id))+1:1,balance:Number(t.balance)};return U.accounts.push(e),e}async function _(t,e){s();try{if(await E()){let a=d(),n=[],o=[],c=1;void 0!==e.name&&(n.push(`name = $${c++}`),o.push(e.name)),void 0!==e.type&&(n.push(`type = $${c++}`),o.push(e.type)),void 0!==e.balance&&(n.push(`balance = $${c++}`),o.push(e.balance)),void 0!==e.color&&(n.push(`color = $${c++}`),o.push(e.color)),o.push(t);let i=`UPDATE accounts SET ${n.join(", ")} WHERE id = $${c} RETURNING *`,r=await a.query(i,o);if(r.rows.length){let t=r.rows[0];return{...t,balance:parseFloat(t.balance)}}return null}}catch(t){}let a=U.accounts.findIndex(e=>e.id===t);return -1!==a?(U.accounts[a]={...U.accounts[a],...e},U.accounts[a]):null}async function T(t){s();try{if(await E()){let e=d();return await e.query("DELETE FROM accounts WHERE id = $1",[t]),!0}}catch(t){}return U.accounts=U.accounts.filter(e=>e.id!==t),!0}async function g(){let t="categories_all",e=i(t);if(e)return e;try{if(await E()){let e=d(),a=await e.query("SELECT * FROM categories ORDER BY type ASC, name ASC");return r(t,a.rows),a.rows}}catch(t){}return r(t,U.categories),U.categories}async function N(t){s();try{if(await E()){let e=d();return(await e.query("INSERT INTO categories (name, type, colour, icon) VALUES ($1, $2, $3, $4) RETURNING *",[t.name,t.type,t.colour||"#94a3b8",t.icon||"tag"])).rows[0]}}catch(t){}let e={...t,id:U.categories.length?Math.max(...U.categories.map(t=>t.id))+1:1};return U.categories.push(e),e}async function R(t){try{if(await E()){let e=d(),a=`
        SELECT t.id, t.account_id, t.category_id, t.amount, t.type, t.description, t.date, t.notes, t.created_at,
               a.name as account_name,
               c.name as category_name,
               c.colour as category_colour,
               c.icon as category_icon
        FROM transactions t
        LEFT JOIN accounts a ON t.account_id = a.id
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE 1=1
      `,n=[],o=1;return t?.account_id&&(a+=` AND t.account_id = $${o++}`,n.push(t.account_id)),t?.category_id&&(a+=` AND t.category_id = $${o++}`,n.push(t.category_id)),t?.type&&(a+=` AND t.type = $${o++}`,n.push(t.type)),t?.search&&(a+=` AND (t.description ILIKE $${o} OR t.notes ILIKE $${o})`,n.push(`%${t.search}%`),o++),t?.date_from&&(a+=` AND t.date >= $${o++}`,n.push(t.date_from)),t?.date_to&&(a+=` AND t.date <= $${o++}`,n.push(t.date_to)),a+=" ORDER BY t.date DESC, t.id DESC",t?.limit&&(a+=` LIMIT $${o++}`,n.push(t.limit)),t?.offset&&(a+=` OFFSET $${o++}`,n.push(t.offset)),(await e.query(a,n)).rows.map(t=>({...t,amount:parseFloat(t.amount),date:t.date instanceof Date?t.date.toISOString().split("T")[0]:String(t.date)}))}}catch(t){}let e=[...U.transactions];if(t?.account_id&&(e=e.filter(e=>e.account_id===t.account_id)),t?.category_id&&(e=e.filter(e=>e.category_id===t.category_id)),t?.type&&(e=e.filter(e=>e.type===t.type)),t?.search){let a=t.search.toLowerCase();e=e.filter(t=>t.description.toLowerCase().includes(a)||t.notes?.toLowerCase().includes(a))}t?.date_from&&(e=e.filter(e=>e.date>=t.date_from)),t?.date_to&&(e=e.filter(e=>e.date<=t.date_to));let a=e.sort((t,e)=>new Date(e.date).getTime()-new Date(t.date).getTime()).map(t=>{let e=U.accounts.find(e=>e.id===t.account_id),a=U.categories.find(e=>e.id===t.category_id);return{...t,account_name:e?.name,category_name:a?.name,category_colour:a?.colour,category_icon:a?.icon}});return t?.offset!==void 0&&t?.limit!==void 0?a.slice(t.offset,t.offset+t.limit):t?.limit!==void 0?a.slice(0,t.limit):a}async function S(t){s();try{if(await E()){let e=d(),a=await e.connect();try{await a.query("BEGIN");let e=(await a.query(`INSERT INTO transactions (account_id, category_id, amount, type, description, date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,[t.account_id,t.category_id||null,t.amount,t.type,t.description,t.date,t.notes||null])).rows[0];return"income"===t.type?await a.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2",[t.amount,t.account_id]):"expense"===t.type&&await a.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2",[t.amount,t.account_id]),await a.query("COMMIT"),{...e,amount:parseFloat(e.amount),date:e.date instanceof Date?e.date.toISOString().split("T")[0]:e.date}}catch(t){throw await a.query("ROLLBACK"),t}finally{a.release()}}}catch(t){}let e={...t,id:U.transactions.length?Math.max(...U.transactions.map(t=>t.id))+1:1,amount:Number(t.amount)};U.transactions.unshift(e);let a=U.accounts.find(e=>e.id===t.account_id);return a&&("income"===t.type?a.balance+=e.amount:"expense"===t.type&&(a.balance-=e.amount)),e}async function A(t){s();let e=[];for(let a of t){let t=await S(a);e.push(t)}return e}async function L(t){s();try{if(await E()){let e=d(),a=await e.connect();try{await a.query("BEGIN");let e=await a.query("SELECT * FROM transactions WHERE id = $1",[t]);if(e.rows.length){let n=e.rows[0];"income"===n.type?await a.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2",[n.amount,n.account_id]):"expense"===n.type&&await a.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2",[n.amount,n.account_id]),await a.query("DELETE FROM transactions WHERE id = $1",[t])}return await a.query("COMMIT"),!0}catch(t){throw await a.query("ROLLBACK"),t}finally{a.release()}}}catch(t){}let e=U.transactions.find(e=>e.id===t);if(e){let a=U.accounts.find(t=>t.id===e.account_id);a&&("income"===e.type?a.balance-=e.amount:"expense"===e.type&&(a.balance+=e.amount)),U.transactions=U.transactions.filter(e=>e.id!==t)}return!0}async function f(t){let e=t||new Date().toISOString().slice(0,7)+"-01";try{if(await E()){let t=d(),a=`
        SELECT b.id, b.category_id, b.amount, b.month,
               c.name as category_name, c.colour as category_colour, c.icon as category_icon,
               COALESCE(spent_sub.total, 0) as spent
        FROM budgets b
        JOIN categories c ON b.category_id = c.id
        LEFT JOIN (
          SELECT category_id, SUM(amount) as total
          FROM transactions
          WHERE type = 'expense'
            AND date >= $1::date
            AND date < ($1::date + INTERVAL '1 month')
          GROUP BY category_id
        ) spent_sub ON b.category_id = spent_sub.category_id
        WHERE b.month = $1::date
      `;return(await t.query(a,[e])).rows.map(t=>{let a=parseFloat(t.amount),n=parseFloat(t.spent||0);return{id:t.id,category_id:t.category_id,amount:a,month:e,category_name:t.category_name,category_colour:t.category_colour,category_icon:t.category_icon,spent:n,remaining:a-n,pct:a>0?Math.round(n/a*100):0}})}}catch(t){}return U.budgets.map(t=>{let a=U.categories.find(e=>e.id===t.category_id),n=U.transactions.filter(a=>a.category_id===t.category_id&&"expense"===a.type&&a.date.startsWith(e.slice(0,7))).reduce((t,e)=>t+e.amount,0);return{...t,category_name:a?.name,category_colour:a?.colour,category_icon:a?.icon,spent:n,remaining:t.amount-n,pct:t.amount>0?Math.round(n/t.amount*100):0}})}async function O(t,e,a){s();let n=7===a.length?`${a}-01`:a;try{if(await E()){let a=d(),o=(await a.query(`INSERT INTO budgets (category_id, amount, month)
         VALUES ($1, $2, $3)
         ON CONFLICT (category_id, month)
         DO UPDATE SET amount = EXCLUDED.amount
         RETURNING *`,[t,e,n])).rows[0];return{...o,amount:parseFloat(o.amount)}}}catch(t){}let o=U.budgets.find(e=>e.category_id===t&&e.month.startsWith(n.slice(0,7)));if(o)return o.amount=e,o;let c={id:U.budgets.length?Math.max(...U.budgets.map(t=>t.id))+1:1,category_id:t,amount:e,month:n};return U.budgets.push(c),c}async function I(){try{if(await E()){let t=d();return(await t.query(`
        SELECT r.id, r.name, r.amount, r.category_id, r.account_id, r.frequency, r.next_due_date, r.status,
               c.name as category_name, c.colour as category_colour, c.icon as category_icon
        FROM recurring_bills r
        LEFT JOIN categories c ON r.category_id = c.id
        ORDER BY r.next_due_date ASC
      `)).rows.map(t=>({...t,amount:parseFloat(t.amount),next_due_date:t.next_due_date instanceof Date?t.next_due_date.toISOString().split("T")[0]:String(t.next_due_date)}))}}catch(t){}return U.recurring.map(t=>{let e=U.categories.find(e=>e.id===t.category_id);return{...t,category_name:e?.name,category_colour:e?.colour,category_icon:e?.icon}})}async function h(t){s();try{if(await E()){let e=d(),a=(await e.query(`INSERT INTO recurring_bills (name, amount, category_id, account_id, frequency, next_due_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,[t.name,t.amount,t.category_id||null,t.account_id||null,t.frequency,t.next_due_date,t.status||"active"])).rows[0];return{...a,amount:parseFloat(a.amount)}}}catch(t){}let e={...t,id:U.recurring.length?Math.max(...U.recurring.map(t=>t.id))+1:1};return U.recurring.push(e),e}async function C(t=2026,e){let a=`analytics_${t}_${e||"all"}`,n=i(a);if(n)return n;let o=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],c=Array.from({length:12},(t,e)=>({month:e+1,month_name:o[e],income:0,expenses:0,net:0,savings_rate:0}));try{if(await E()){let n=d(),o=`
        SELECT EXTRACT(MONTH FROM date) as m,
               SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as inc,
               SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as exp
        FROM transactions
        WHERE EXTRACT(YEAR FROM date) = $1
      `,i=[t];for(let t of(e&&(o+=" AND account_id = $2",i.push(e)),o+=" GROUP BY m ORDER BY m ASC",(await n.query(o,i)).rows)){let e=parseInt(t.m);if(e>=1&&e<=12){let a=parseFloat(t.inc||0),n=parseFloat(t.exp||0);c[e-1].income=a,c[e-1].expenses=n,c[e-1].net=a-n,c[e-1].savings_rate=a>0?Math.max(0,Math.round((a-n)/a*100)):0}}let s=`
        SELECT t.category_id, c.name, c.colour, c.icon, SUM(t.amount) as total
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.type = 'expense' AND EXTRACT(YEAR FROM t.date) = $1
      `;e&&(s+=" AND t.account_id = $2"),s+=" GROUP BY t.category_id, c.name, c.colour, c.icon ORDER BY total DESC";let u=await n.query(s,i),l=u.rows.reduce((t,e)=>t+parseFloat(e.total),0)||1,E=u.rows.map(t=>{let e=parseFloat(t.total);return{category_id:t.category_id,category:t.name||"Uncategorized",colour:t.colour||"#94a3b8",icon:t.icon||"tag",total:e,pct:Math.round(e/l*100)}}),y={monthly:c,categories:E};return r(a,y),y}}catch(t){}for(let e of U.transactions){let a=new Date(e.date);if(a.getFullYear()===t){let t=a.getMonth();"income"===e.type?c[t].income+=e.amount:"expense"===e.type&&(c[t].expenses+=e.amount)}}for(let t of c)t.net=t.income-t.expenses,t.savings_rate=t.income>0?Math.max(0,Math.round((t.income-t.expenses)/t.income*100)):0;let s=new Map,u=0;for(let t of U.transactions)if("expense"===t.type){let e=U.categories.find(e=>e.id===t.category_id),a=s.get(t.category_id||0)||{name:e?.name||"Uncategorized",colour:e?.colour||"#94a3b8",icon:e?.icon||"tag",total:0};a.total+=t.amount,s.set(t.category_id||0,a),u+=t.amount}let l=Array.from(s.entries()).map(([t,e])=>({category_id:0===t?null:t,category:e.name,colour:e.colour,icon:e.icon,total:e.total,pct:u>0?Math.round(e.total/u*100):0})),y={monthly:c,categories:l};return r(a,y),y}n()}catch(t){n(t)}})}};