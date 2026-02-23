const u=(l,o,s="export")=>{const c=o.map(r=>r.label||r.key).join(","),p=l.map(r=>o.map(i=>{let d=r[i.key];if(i.transform&&typeof i.transform=="function"&&(d=i.transform(r)),d==null)return"";const a=String(d);return a.includes(",")||a.includes('"')||a.includes(`
`)?`"${a.replace(/"/g,'""')}"`:a}).join(",")),t=[c,...p].join(`
`),e="\uFEFF",b=new Blob([e+t],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a"),m=URL.createObjectURL(b);n.setAttribute("href",m),n.setAttribute("download",`${s}.csv`),n.style.visibility="hidden",document.body.appendChild(n),n.click(),document.body.removeChild(n)},h=(l,o,s="Export",c="export")=>{const p=`
    <div>
      <h1>${s}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${o.map(e=>`<th>${e.label||e.key}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${l.map(e=>`
            <tr>
              ${o.map(b=>`<td>${e[b.key]??""}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `,t=window.open("","_blank");t.document.write(`
    <html>
      <head>
        <title>${c}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          @media print {
            body { margin: 0; }
            @page { margin: 1cm; }
          }
        </style>
      </head>
      <body>
        ${p}
      </body>
    </html>
  `),t.document.close(),t.focus(),setTimeout(()=>{t.print(),t.close()},250)};export{h as a,u as e};
