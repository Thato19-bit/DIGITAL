import re
p="src/App.tsx"
s=open(p,encoding="utf-8").read()
start=s.index("function Marketplace(")
end=s.index("function Reports()")
new='''function Marketplace({ notify }: { notify: (n: Notice) => void }) {
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "markets"))
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      if (list.length === 0) {
        const seed = [
          { name: "Premium Pinto Beans", seller: "Thaba Bosiu Growers", price: "M 8.50/kg", qty: "600 kg", img: "https://images.unsplash.com/photo-1603048719539-9ecb4aa395e3?auto=format&fit=crop&w=700&q=80" },
          { name: "White Maize", seller: "Mafeteng Harvest Co.", price: "M 5.20/kg", qty: "1.4 tonnes", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=700&q=80" },
          { name: "Fresh Spinach", seller: "Roma Valley Farm", price: "M 12/bunch", qty: "180 bunches", img: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=700&q=80" },
        ]
        for (const s of seed) await addDoc(collection(db, "markets"), s)
        setItems(seed.map((s, i) => ({ id: String(i), ...s })))
      } else {
        setItems(list)
      }
      setLoading(false)
    })()
  }, [])
  const filtered = items.filter((x) => JSON.stringify(x).toLowerCase().includes(search.toLowerCase()))
  const sell = async () => {
    const name = prompt("Produce name")
    if (!name) return
    const price = prompt("Price") || ""
    const qty = prompt("Quantity") || ""
    const seller = prompt("Seller") || ""
    const docRef = await addDoc(collection(db, "markets"), { name, price, qty, seller, img: "" })
    setItems((m) => [...m, { id: docRef.id, name, price, qty, seller, img: "" }])
    notify({ title: "Listed", text: `${name} added to marketplace.` })
  }
  return (
    <div className="page">
      <Head kicker="Verified local trade" title="Climate-smart Marketplace" copy="Sell directly, buy confidently, and keep value within Lesotho." action={<button className="primary" onClick={sell}><Plus /> Sell produce</button>} />
      <div className="toolbar">
        <label><Search /><input placeholder="Search produce, farmer or district" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      </div>
      <div className="products">
        {loading && <p>Loading...</p>}
        {filtered.map((x) => (
          <article key={x.id}>
            <div style={{ backgroundImage: `url("${x.img}")` }}><mark><BadgeCheck /> Climate-smart verified</mark></div>
            <section>
              <small>{x.seller}</small>
              <h3>{x.name}</h3>
              <p><MapPin /> Lesotho · {x.qty} available</p>
              <footer>
                <b>{x.price}</b>
                <button className="primary" onClick={() => notify({ title: "Enquiry added", text: `${x.name} is in your buyer enquiry.` })}>Enquire</button>
              </footer>
            </section>
          </article>
        ))}
      </div>
    </div>
  )
}

'''
s=s[:start]+new+s[end:]
open(p,"w",encoding="utf-8").write(s)
print("done")
PY