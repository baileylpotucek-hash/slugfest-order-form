import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzDevM6d8_Ogtn5gK87xIGx4lmQBIXBKpiKG3J7q5nShTAUqO35o2jGI9U9roJz6y0t/exec';
const VENMO_LINK = 'https://venmo.com/u/tribebaseballbjostad';
const VENMO_NAME = '@tribebaseballbjostad';

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
  }).format(value || 0);
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function App() {
  const [cart, setCart] = useState([]);
  const [shirtType, setShirtType] = useState('Adult');
  const [size, setSize] = useState('');
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

  const currentPrice = size ? getPrice(shirtType, size) : 0;
  const currentLineTotal = currentPrice * quantity;

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
    [cart]
  );

  function handleTypeChange(nextType) {
    setShirtType(nextType);
    setSize('');
  }

  function addToCart() {
    if (!size) {
      setStatus('error');
      setMessage('Please select a size before adding to order.');
      return;
    }

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

    setStatus('idle');
    setMessage('');
    setQuantity(1);
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
      setMessage('Shipping is at cost. Please text/call 620-222-2517 for pricing before submitting your order.');
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
      <header className="topbar">
        <div className="brandMark">
          <span className="miniLogo">⚾</span>
          <span>Clearwater Tribe Baseball</span>
        </div>
        <nav>
          <a href="#details">Details</a>
          <a href="#order">Order Shirts</a>
          <a href="#payment">Venmo</a>
        </nav>
      </header>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">Clearwater Tribe</p>
          <h1>
            Slugfest 2026
            <span>Shirt Pre-Order</span>
          </h1>
          <p>
            Official tournament shirts in <strong>Sport Grey</strong>. Orders are pre-order only
            and will be available for pickup at the tournament.
          </p>

          <div className="iconRow">
            <div>
              <span className="icon">👕</span>
              <strong>Sport Grey</strong>
            </div>
            <div>
              <span className="icon">☁️</span>
              <strong>Gildan Shirts</strong>
            </div>
            <div>
              <span className="icon">🏆</span>
              <strong>Tournament Pickup</strong>
            </div>
          </div>

          <a className="primaryLink" href="#order">
            Order Now ↓
          </a>
        </div>

        <div className="heroShirts">
          <img className="frontHero" src="/images/shirt-front.png" alt="Slugfest shirt front" />
          <img className="backHero" src="/images/shirt-back.png" alt="Slugfest shirt back" />
        </div>
      </section>

      <section id="details" className="details section">
        <div className="sectionTitle">
          <span></span>
          <h2>Shirt Details</h2>
          <span></span>
        </div>

        <div className="detailsGrid">
          <div>
            <h3>Front</h3>
            <img src="/images/shirt-front.png" alt="Front shirt mockup" />
          </div>
          <div>
            <h3>Back</h3>
            <img src="/images/shirt-back.png" alt="Back shirt mockup" />
          </div>
          <div className="colorCard">
            <h3>Color</h3>
            <div className="swatch"></div>
            <strong>Sport Grey</strong>
          </div>
        </div>
      </section>

      <section id="order" className="orderGrid section">
        <div>
          <div className="card">
            <div className="cardHeader">Build Your Order</div>

            <label className="label">Shirt Type</label>
            <div className="tabRow">
              {['Adult', 'Youth', 'Toddler'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={shirtType === type ? 'active' : ''}
                  onClick={() => handleTypeChange(type)}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="fields two">
              <label>
                Size
                <select value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="">Select size</option>
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
                  max="25"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                />
              </label>
            </div>

            <div className="priceInline">
              <span>Price</span>
              <strong>{money(currentLineTotal)}</strong>
            </div>

            <button type="button" className="primaryButton" onClick={addToCart}>
              Add to Order
            </button>
          </div>

          <div className="card pricing">
            <div className="cardHeader">Pricing</div>
            <div className="pricingGrid">
              <div>
                <h3>Adult</h3>
                <p>XS–XL <strong>$17</strong></p>
                <p>2XL <strong>$18</strong></p>
                <p>3XL <strong>$19</strong></p>
                <p>4XL–5XL <strong>$20</strong></p>
              </div>
              <div>
                <h3>Youth</h3>
                <p>XS–XL <strong>$12</strong></p>
              </div>
              <div>
                <h3>Toddler</h3>
                <p>2T–6T <strong>$10</strong></p>
              </div>
            </div>
          </div>

          <div className="card pickup">
            <div className="infoLine">
              <span>📍</span>
              <div>
                <h3>Pickup</h3>
                <p>Tournament pickup included with all orders.</p>
              </div>
            </div>
            <div className="infoLine">
              <span>🚚</span>
              <div>
                <h3>Shipping</h3>
                <p>
                  Shipping is at cost. If shipping is needed, please text/call
                  <strong> 620-222-2517</strong> for pricing before ordering.
                </p>
              </div>
            </div>
          </div>

          <div id="payment" className="card venmoCard">
            <div className="cardHeader">Complete Payment via Venmo</div>
            <div className="venmoContent">
              <div className="venmoLogo">Venmo</div>
              <div>
                <a className="venmoButton" href={VENMO_LINK} target="_blank" rel="noreferrer">
                  Pay with Venmo
                </a>
                <p>{VENMO_NAME}</p>
              </div>
            </div>
            <p className="finePrint">
              Your order is not finalized until payment has been submitted through Venmo.
              Please include your name in the Venmo payment notes.
            </p>
          </div>
        </div>

        <form className="card checkout" onSubmit={submitOrder}>
          <div className="cardHeader">Your Order</div>

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
              <p className="empty">🛒 Your cart is empty.</p>
            )}
          </div>

          <div className="total">
            <span>Order Total</span>
            <strong>{money(total)}</strong>
          </div>

          <div className="cardHeader">Customer Information</div>

          <div className="fields">
            <label className="full">
              Full Name *
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" />
            </label>

            <label>
              Phone Number *
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" />
            </label>

            <label>
              Email Address *
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" />
            </label>

            <label className="full">
              Mailing Address *
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter your mailing address" />
            </label>

            <label>
              Shipping Needed?
              <select value={shippingNeeded} onChange={(e) => setShippingNeeded(e.target.value)}>
                <option value="No">No (Pick up at tournament)</option>
                <option value="Yes">Yes — text/call 620-222-2517 for pricing</option>
              </select>
            </label>

            <label>
              Venmo Username or Name
              <input
                value={venmoName}
                onChange={(e) => setVenmoName(e.target.value)}
                placeholder="Enter Venmo username or name"
              />
            </label>

            {shippingNeeded === 'Yes' && (
              <div className="warning full">
                Shipping is at cost. Text/call 620-222-2517 for pricing before submitting.
              </div>
            )}

            <label className="checkbox full">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
              I have submitted Venmo payment.
            </label>

            <label className="full">
              Additional Notes
              <textarea rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes for your order?" />
            </label>
          </div>

          <button className="primaryButton submitButton" type="submit">
            Submit Shirt Pre-Order ✈
          </button>

          {message && <div className={`status ${status}`}>{message}</div>}
        </form>
      </section>

      <footer className="footer">
        <span>Clearwater Tribe Baseball</span>
        <strong>Thank you for supporting Tribe Baseball!</strong>
        <span>Questions? Call/Text 620-222-2517</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
