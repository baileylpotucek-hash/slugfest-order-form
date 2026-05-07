import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
const VENMO_LINK = 'YOUR_VENMO_LINK_HERE';

const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
const YOUTH_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const TODDLER_SIZES = ['2T', '3T', '4T', '5T', '6T'];

function getSizeOptions(type) {
  if (type === 'Adult') return ADULT_SIZES;
  if (type === 'Youth') return YOUTH_SIZES;
  return TODDLER_SIZES;
}

function getPrice(type, size) {
  if (type === 'Adult') {
    if (['XS', 'S', 'M', 'L', 'XL'].includes(size)) return 17;
    if (size === '2XL') return 18;
    if (size === '3XL') return 19;
    return 20;
  }

  if (type === 'Youth') return 12;
  return 10;
}

function money(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function App() {
  const [cart, setCart] = useState([]);
  const [shirtType, setShirtType] = useState('Adult');
  const [size, setSize] = useState('M');
  const [quantity, setQuantity] = useState(1);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [shippingNeeded, setShippingNeeded] = useState('No');
  const [venmoName, setVenmoName] = useState('');
  const [paid, setPaid] = useState(false);
  const [notes, setNotes] = useState('');

  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const currentPrice = getPrice(shirtType, size);
  const currentLineTotal = currentPrice * quantity;

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.lineTotal, 0),
    [cart]
  );

  function handleTypeChange(nextType) {
    setShirtType(nextType);
    const nextSizes = getSizeOptions(nextType);
    setSize(nextSizes[0]);
  }

  function addToCart() {
    setCart((current) => [
      ...current,
      {
        id: makeId(),
        shirtType,
        size,
        quantity,
        unitPrice: currentPrice,
        lineTotal: currentLineTotal,
      },
    ]);
  }

  function removeItem(id) {
    setCart((current) => current.filter((item) => item.id !== id));
  }

  async function submitOrder(e) {
    e.preventDefault();

    if (!cart.length) {
      setStatus('error');
      setMessage('Please add at least one shirt to your order.');
      return;
    }

    if (!name || !phone || !email || !address) {
      setStatus('error');
      setMessage('Please complete name, phone, email, and address.');
      return;
    }

    if (shippingNeeded === 'Yes') {
      setStatus('error');
      setMessage('Shipping must be arranged first. Please contact 620-222-2517 before submitting.');
      return;
    }

    if (!paid) {
      setStatus('error');
      setMessage('Please complete Venmo payment and check the payment confirmation box.');
      return;
    }

    const payload = {
      submittedAt: new Date().toISOString(),
      name,
      phone,
      email,
      address,
      shippingNeeded,
      venmoName,
      paid,
      notes,
      pickup: 'Pick up at tournament',
      total,
      items: cart,
    };

    try {
      setStatus('loading');
      setMessage('Submitting your shirt pre-order...');

      const formBody = new URLSearchParams();
      formBody.append('payload', JSON.stringify(payload));

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formBody,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed.');
      }

      setStatus('success');
      setMessage('Shirt pre-order submitted successfully.');
      setCart([]);
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setShippingNeeded('No');
      setVenmoName('');
      setPaid(false);
      setNotes('');
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Something went wrong while submitting your order.');
    }
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">Clearwater Tribe Baseball</p>
          <h1>Slugfest 2026 Shirt Pre-Order</h1>
          <p>
            Official tournament shirts in <strong>Sport Grey</strong>. Orders are pre-order only
            and will be available for pickup at the tournament.
          </p>

          <div className="badges">
            <span>Sport Grey</span>
            <span>Gildan Shirts</span>
            <span>Tournament Pickup</span>
          </div>

          <a className="primaryLink" href="#order">
            Order Shirts
          </a>
        </div>

        <div className="mockupCard">
          <img src="/images/shirt-front-back.png" alt="Slugfest shirt front and back" />
        </div>
      </section>

      <section className="section">
        <div className="mockupGrid">
          <img src="/images/shirt-front.png" alt="Front shirt mockup" />
          <img src="/images/shirt-back.png" alt="Back shirt mockup" />
        </div>
      </section>

      <section id="order" className="section orderGrid">
        <div className="card">
          <p className="eyebrow">Build Your Order</p>
          <h2>Select shirt options</h2>

          <div className="fields">
            <label>
              Shirt Type
              <select value={shirtType} onChange={(e) => handleTypeChange(e.target.value)}>
                <option>Adult</option>
                <option>Youth</option>
                <option>Toddler</option>
              </select>
            </label>

            <label>
              Size
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {getSizeOptions(shirtType).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>

            <label>
              Quantity
              <input
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              />
            </label>
          </div>

          <div className="priceBox">
            <span>Line Total</span>
            <strong>{money(currentLineTotal)}</strong>
          </div>

          <button type="button" className="primaryButton" onClick={addToCart}>
            Add Shirt to Order
          </button>

          <div className="infoBox">
            <h3>Pricing</h3>
            <p>Adult XS–XL: $17 · 2XL: $18 · 3XL: $19 · 4XL–5XL: $20</p>
            <p>Youth XS–XL: $12 · Toddler 2T–6T: $10</p>
          </div>
        </div>

        <form className="card" onSubmit={submitOrder}>
          <p className="eyebrow">Checkout</p>
          <h2>Submit pre-order</h2>

          <div className="cart">
            {cart.length ? (
              cart.map((item) => (
                <div className="cartItem" key={item.id}>
                  <div>
                    <strong>{item.shirtType} {item.size}</strong>
                    <p>Qty {item.quantity} · {money(item.unitPrice)} each</p>
                  </div>
                  <div>
                    <strong>{money(item.lineTotal)}</strong>
                    <button type="button" onClick={() => removeItem(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty">No shirts added yet.</p>
            )}
          </div>

          <div className="total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="fields">
            <label className="full">
              Full Name *
              <input value={name} onChange={(e) => setName(e.target.value)} />
            </label>

            <label>
              Phone *
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>

            <label>
              Email *
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>

            <label className="full">
              Address *
              <input value={address} onChange={(e) => setAddress(e.target.value)} />
            </label>

            <label className="full">
              Shipping Needed?
              <select value={shippingNeeded} onChange={(e) => setShippingNeeded(e.target.value)}>
                <option>No</option>
                <option>Yes</option>
              </select>
            </label>

            {shippingNeeded === 'Yes' && (
              <div className="warning full">
                Shipping is at cost and must be arranged first. Contact 620-222-2517 before submitting.
              </div>
            )}

            <label className="full">
              Venmo Name / Username
              <input
                value={venmoName}
                onChange={(e) => setVenmoName(e.target.value)}
                placeholder="@username or name used for payment"
              />
            </label>

            <label className="checkbox full">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
              I submitted Venmo payment.
            </label>

            <label className="full">
              Notes
              <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
          </div>

          <a className="venmoButton" href={VENMO_LINK} target="_blank" rel="noreferrer">
            Pay with Venmo
          </a>

          <p className="paymentNote">
            Your order is not finalized until payment has been submitted through Venmo.
            Please include your name in the Venmo payment notes.
          </p>

          <button className="primaryButton" type="submit">
            Submit Shirt Pre-Order
          </button>

          {message && <div className={`status ${status}`}>{message}</div>}
        </form>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
