"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingCart,
  Calculator as CalcIcon,
  Scale,
  List as ListIcon,
  Trash2,
  Plus,
  X,
  Layers,
  Barcode,
  CheckCircle,
  Clock,
  Search,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Check,
  Edit2,
} from "lucide-react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface CartItem {
  id: string;
  name: string;
  type: "peso" | "unidade" | "calc";
  details: string;
  value: number;
  timestamp: number;
  quantity?: number;
  weight?: number;
  unitPrice?: number;
}

interface Purchase {
  id: string;
  timestamp: number;
  total: number;
  items: CartItem[];
}

interface FixedItem {
  id: string;
  name: string;
  checked: boolean;
}

const formatCurrencyInput = (digits: string) => {
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatIntegerInput = (digits: string) => {
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return new Intl.NumberFormat("pt-BR").format(num);
};

const formatCalcDisplay = (digitsStr: string) => {
  let isNeg = false;
  let str = digitsStr;
  if (str.startsWith("-")) {
    isNeg = true;
    str = str.substring(1);
  }
  const parts = str.split(".");
  const intPart = parseInt(parts[0] || "0", 10);
  const formattedInt = new Intl.NumberFormat("pt-BR").format(intPart);
  const sign = isNeg ? "-" : "";

  if (parts.length > 1) {
    return sign + formattedInt + "," + parts[1];
  }
  return sign + formattedInt;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "peso" | "unidade" | "calc" | "lista"
  >("calc");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [history, setHistory] = useState<Purchase[]>([]);
  const [fixedList, setFixedList] = useState<FixedItem[]>([]);
  const [themeColor, setThemeColor] = useState("#C1FF72");
  const [isHydrated, setIsHydrated] = useState(false);
  const [scannedName, setScannedName] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = ["#C1FF72", "#FFEA00", "#FF6D00", "#FF00FF", "#9D00FF", "#00FFFF", "#39FF14"];

  useEffect(() => {
    const saved = localStorage.getItem("@CalculadoraFeira:cart");
    const savedHistory = localStorage.getItem("@CalculadoraFeira:history");
    const savedTheme = localStorage.getItem("@CalculadoraFeira:themeColor");
    const savedFixed = localStorage.getItem("@CalculadoraFeira:fixedList");

    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeColor(savedTheme);
    }

    if (savedFixed) {
      try {
        setFixedList(JSON.parse(savedFixed));
      } catch (e) {
        console.error("Failed to load fixed list", e);
      }
    }

    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load cart", e);
      }
    }

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("@CalculadoraFeira:cart", JSON.stringify(cart));
      localStorage.setItem(
        "@CalculadoraFeira:history",
        JSON.stringify(history),
      );
      localStorage.setItem("@CalculadoraFeira:themeColor", themeColor);
      localStorage.setItem(
        "@CalculadoraFeira:fixedList",
        JSON.stringify(fixedList),
      );
    }
  }, [cart, history, themeColor, fixedList, isHydrated]);

  const total = cart.reduce((acc, item) => acc + item.value, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const parseInput = (val: string) => {
    const parsed = parseFloat(val.replace(",", "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  const addToCart = (
    name: string,
    type: "peso" | "unidade" | "calc",
    details: string,
    value: number,
    quantity?: number,
    weight?: number,
    unitPrice?: number,
  ) => {
    if (value <= 0) return;
    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      name:
        name ||
        (type === "peso"
          ? "Produto por Peso"
          : type === "unidade"
            ? "Produto"
            : "Cálculo Avulso"),
      type,
      details,
      value,
      timestamp: Date.now(),
      quantity,
      weight,
      unitPrice,
    };
    setCart([newItem, ...cart]);
    setActiveTab("lista");
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const removeMultipleFromCart = (ids: string[]) => {
    setCart(cart.filter((item) => !ids.includes(item.id)));
  };

  const clearCart = () => {
    if (confirm("Tem certeza que deseja apagar toda a lista de compras?")) {
      setCart([]);
      setFixedList(fixedList.map((item) => ({ ...item, checked: false })));
    }
  };

  const clearHistory = () => {
    if (confirm("Tem certeza que deseja apagar todo o histórico de compras?")) {
      setHistory([]);
    }
  };

  const removeHistoryItems = (ids: string[]) => {
    if (confirm("Tem certeza que deseja apagar o histórico selecionado?")) {
      setHistory(history.filter((p) => !ids.includes(p.id)));
    }
  };

  const updateHistoryItem = (
    purchaseId: string,
    itemId: string,
    updates: Partial<CartItem>,
  ) => {
    setHistory(
      history.map((p) => {
        if (p.id === purchaseId) {
          return {
            ...p,
            items: p.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item,
            ),
          };
        }
        return p;
      }),
    );
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCart(
      cart.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
    );
  };

  const finishShopping = () => {
    if (cart.length === 0) return;
    // eslint-disable-next-line react-hooks/purity
    const id = Math.random().toString(36).substr(2, 9);
    // eslint-disable-next-line react-hooks/purity
    const timestamp = Date.now();
    const newPurchase: Purchase = {
      id,
      timestamp,
      total,
      items: [...cart],
    };
    setHistory([newPurchase, ...history]);
    setCart([]);
    setFixedList(fixedList.map((item) => ({ ...item, checked: false })));
    alert("Feira finalizada e salva no histórico!");
  };

  return (
    <div
      className="min-h-[100dvh] bg-[#0F0F11] text-white font-sans flex flex-col pb-[90px]"
      style={{ "--tc": themeColor } as any}
    >
      <header className="sticky top-0 z-30 bg-[#0F0F11]/90 backdrop-blur-md border-b border-[#2D2E33] p-4 flex justify-between items-center pt-safe-top">
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 flex items-center justify-center bg-[var(--tc)] text-[#0F0F11] font-extrabold rounded-lg text-lg leading-none active:scale-95 transition-all"
          >
            RF
          </button>

          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.9 }}
                className="absolute left-0 top-full mt-2 bg-[#1A1B1E] border border-[#2D2E33] rounded-lg p-2 flex gap-1.5 z-50 shadow-2xl"
              >
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setThemeColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform ${themeColor === c ? "border-white scale-110" : "border-transparent hover:scale-110"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <h1 className="text-xl font-semibold tracking-tight text-white">
            Calculadora
          </h1>
        </div>

        <div className="flex items-center bg-[#1A1B1E] border border-[var(--tc)]/30 rounded-lg px-3 py-1.5 shadow-sm">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-[var(--tc)] uppercase tracking-wider font-bold mb-[1px]">
              Total • {cart.length} {cart.length === 1 ? "item" : "itens"}
            </span>
            <span className="text-[14px] font-mono font-bold text-white leading-none">
              {formatCurrency(total)}
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto p-4 pt-4 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          {activeTab === "peso" && (
            <WeightCalculator
              key="peso"
              onAdd={addToCart}
              format={formatCurrency}
              parse={parseInput}
              scannedName={scannedName}
            />
          )}
          {activeTab === "unidade" && (
            <UnitCalculator
              key="unidade"
              onAdd={addToCart}
              format={formatCurrency}
              parse={parseInput}
              scannedName={scannedName}
            />
          )}
          {activeTab === "calc" && (
            <StandardCalculator
              key="calc"
              onAdd={addToCart}
              format={formatCurrency}
              currentTheme={themeColor}
              onThemeChange={setThemeColor}
            />
          )}
          {activeTab === "lista" && (
            <ShoppingList
              key="lista"
              cart={cart}
              history={history}
              fixedList={fixedList}
              onUpdateFixedList={setFixedList}
              onRemove={removeFromCart}
              onRemoveMultiple={removeMultipleFromCart}
              onClear={clearCart}
              onClearHistory={clearHistory}
              onRemoveHistoryItems={removeHistoryItems}
              onUpdateHistoryItem={updateHistoryItem}
              onUpdateCartItem={updateCartItem}
              onFinish={finishShopping}
              format={formatCurrency}
              onScan={(name) => {
                setScannedName(name);
                setActiveTab("unidade");
              }}
            />
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 w-full bg-[#0F0F11] border-t border-[#2D2E33] z-40 pb-safe">
        <div className="max-w-md mx-auto flex justify-around items-center px-2 py-2">
          <NavItem
            active={activeTab === "calc"}
            onClick={() => setActiveTab("calc")}
            icon={<CalcIcon size={20} />}
            label="Calc"
          />
          <NavItem
            active={activeTab === "peso"}
            onClick={() => setActiveTab("peso")}
            icon={<Scale size={20} />}
            label="Peso"
          />
          <NavItem
            active={activeTab === "unidade"}
            onClick={() => setActiveTab("unidade")}
            icon={<Layers size={20} />}
            label="Unid"
          />
          <NavItem
            active={activeTab === "lista"}
            onClick={() => setActiveTab("lista")}
            icon={<ShoppingCart size={20} />}
            label="Lista"
            badge={cart.length}
          />
        </div>
      </nav>
    </div>
  );
}

function NavItem({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all duration-300 ${active ? "text-[var(--tc)]" : "text-[#A1A1AA] hover:text-white"}`}
    >
      {icon}
      <span className="text-[10px] font-semibold mt-1 uppercase tracking-wider">
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-0 right-1 bg-[#FF5555] text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-sm">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
      {active && (
        <div className="absolute -top-2 w-8 h-[2px] bg-[var(--tc)] rounded-full" />
      )}
    </button>
  );
}

function WeightCalculator({
  onAdd,
  format,
  parse,
  scannedName,
}: {
  onAdd: any;
  format: any;
  parse: any;
  scannedName?: string;
}) {
  const [priceKg, setPriceKg] = useState("");
  const [weight, setWeight] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (scannedName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(scannedName);
    }
  }, [scannedName]);

  const p = priceKg ? parseInt(priceKg) / 100 : 0;
  const w = weight ? parseInt(weight) : 0;
  const calculated = p * (w / 1000);

  const handleAdd = () => {
    if (calculated > 0) {
      onAdd(
        name,
        "peso",
        `${w}g @ ${format(p)}/kg`,
        calculated,
        undefined,
        w,
        p,
      );
      setPriceKg("");
      setWeight("");
      setName("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#1A1B1E] border border-[#2D2E33] rounded-[16px] flex flex-col overflow-hidden shadow-2xl"
    >
      <div className="p-4 border-b border-[#2D2E33] flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#A1A1AA]">
            Pesagem e Conversão
          </span>
          <span className="bg-[var(--tc)] text-[#0F0F11] text-[10px] font-extrabold px-1.5 py-0.5 rounded">
            PESO
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={calculated <= 0}
          className="bg-[var(--tc)] hover:bg-[#A8E659] disabled:bg-[#2D2E33] disabled:text-[#A1A1AA] text-[#0F0F11] w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95 shadow-md"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase">
            Preço por Quilo (R$/kg)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="00,00"
            value={formatCurrencyInput(priceKg)}
            onChange={(e) => setPriceKg(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-black border border-[#2D2E33] rounded-[10px] px-3 py-2 text-[20px] font-mono text-white outline-none focus:border-[var(--tc)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase">
            Peso do Produto (Gramas)
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={formatIntegerInput(weight)}
            onChange={(e) => setWeight(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-black border border-[#2D2E33] rounded-[10px] px-3 py-2 text-[20px] font-mono text-white outline-none focus:border-[var(--tc)] transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase">
            Nome do Produto (Opcional)
          </label>
          <input
            type="text"
            placeholder=""
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-[#2D2E33] rounded-[10px] px-3 py-2 text-[14px] text-white outline-none focus:border-[var(--tc)] transition-colors placeholder:text-[#2D2E33]"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={calculated <= 0}
          className="bg-[var(--tc)]/5 border border-dashed border-[var(--tc)] rounded-[8px] py-1.5 px-3 flex flex-col items-center justify-center w-full transition-colors hover:bg-[var(--tc)]/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <div className="text-[10px] font-semibold text-[#A1A1AA] uppercase mb-0.5">
            Valor Estimado
          </div>
          <div className="text-[24px] font-mono text-[var(--tc)] font-bold tracking-tighter leading-none">
            {format(calculated)}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

function UnitCalculator({
  onAdd,
  format,
  parse,
  scannedName,
}: {
  onAdd: any;
  format: any;
  parse: any;
  scannedName?: string;
}) {
  const [price, setPrice] = useState("");
  const [qtd, setQtd] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (scannedName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(scannedName);
    }
  }, [scannedName]);

  const p = price ? parseInt(price) / 100 : 0;
  const q = qtd ? parseInt(qtd) : 0;
  const calculated = p * q;

  const handleAdd = () => {
    if (calculated > 0) {
      onAdd(
        name,
        "unidade",
        `${q}x @ ${format(p)}/un`,
        calculated,
        q,
        undefined,
        p,
      );
      setPrice("");
      setQtd("");
      setName("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#1A1B1E] border border-[#2D2E33] rounded-[16px] flex flex-col overflow-hidden shadow-2xl"
    >
      <div className="p-4 border-b border-[#2D2E33] flex justify-between items-center bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#A1A1AA]">
            Multiplicador de Unidades
          </span>
          <span className="bg-[var(--tc)] text-[#0F0F11] text-[10px] font-extrabold px-1.5 py-0.5 rounded">
            UNID
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={calculated <= 0}
          className="bg-[var(--tc)] hover:bg-[#A8E659] disabled:bg-[#2D2E33] disabled:text-[#A1A1AA] text-[#0F0F11] w-8 h-8 rounded-lg flex items-center justify-center transition-colors active:scale-95 shadow-md"
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex gap-2.5">
          <div className="flex flex-col gap-1.5 flex-[1]">
            <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase">
              Qtd
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={formatIntegerInput(qtd)}
              onChange={(e) => setQtd(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-black border border-[#2D2E33] rounded-[10px] px-3 py-2 text-[20px] font-mono text-white outline-none focus:border-[var(--tc)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-[2]">
            <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase">
              Valor Unt
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="00,00"
              value={formatCurrencyInput(price)}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              className="w-full bg-black border border-[#2D2E33] rounded-[10px] px-3 py-2 text-[20px] font-mono text-white outline-none focus:border-[var(--tc)] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold text-[#A1A1AA] uppercase">
            Nome do Produto (Opcional)
          </label>
          <input
            type="text"
            placeholder=""
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-black border border-[#2D2E33] rounded-[10px] px-3 py-2 text-[14px] text-white outline-none focus:border-[var(--tc)] transition-colors placeholder:text-[#2D2E33]"
          />
        </div>

        <button
          onClick={handleAdd}
          disabled={calculated <= 0}
          className="bg-[var(--tc)]/5 border border-dashed border-[var(--tc)] rounded-[8px] py-1.5 px-3 flex flex-col items-center justify-center w-full transition-colors hover:bg-[var(--tc)]/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          <div className="text-[10px] font-semibold text-[#A1A1AA] uppercase mb-0.5">
            Valor Estimado
          </div>
          <div className="text-[24px] font-mono text-[var(--tc)] font-bold tracking-tighter leading-none">
            {format(calculated)}
          </div>
        </button>
      </div>
    </motion.div>
  );
}

import { Store, ExternalLink, ArrowRightLeft } from "lucide-react";

function StandardCalculator({
  onAdd,
  format,
  currentTheme,
  onThemeChange,
}: {
  onAdd: any;
  format: any;
  currentTheme: string;
  onThemeChange: (c: string) => void;
}) {
  const [expression, setExpression] = useState("0");
  const [calculatedResult, setCalculatedResult] = useState<string | null>(null);
  const [showMarkets, setShowMarkets] = useState(false);
  const [showConverter, setShowConverter] = useState(false);
  const [rates, setRates] = useState<{ USD: number; EUR: number }>({ USD: 5.5, EUR: 6.0 });
  const [converterDirection, setConverterDirection] = useState<"BRL_TO_FOREIGN" | "FOREIGN_TO_BRL">("BRL_TO_FOREIGN");
  const [converterCurrency, setConverterCurrency] = useState<"USD" | "EUR">("USD");
  const [converterInput, setConverterInput] = useState<string>("");

  useEffect(() => {
    fetch("https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL")
      .then(res => res.json())
      .then(data => {
        if (data.USDBRL && data.EURBRL) {
          setRates({
            USD: parseFloat(data.USDBRL.ask),
            EUR: parseFloat(data.EURBRL.ask)
          });
        }
      })
      .catch(err => console.error("Failed to fetch rates:", err));
  }, []);

  const safeEval = (expr: string) => {
    try {
      const sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/,/g, ".");
      // basic safety check
      if (/[^0-9\+\-\*\/\.\(\)\% ]/.test(sanitized)) return null;
      let res = new Function("return " + sanitized)();
      if (!isFinite(res) || isNaN(res)) return null;
      return res;
    } catch {
      return null;
    }
  };

  const inputDigit = (d: string) => {
    if (calculatedResult !== null) {
      setExpression(d);
      setCalculatedResult(null);
    } else {
      setExpression(expression === "0" ? d : expression + d);
    }
  };

  const inputComma = () => {
    if (calculatedResult !== null) {
      setExpression("0,");
      setCalculatedResult(null);
    } else {
      const parts = expression.split(/[\+\-\×\÷]/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes(",")) {
        setExpression(expression + ",");
      }
    }
  };

  const backspace = () => {
    if (calculatedResult !== null) {
      setCalculatedResult(null);
    } else {
      setExpression(expression.length > 1 ? expression.slice(0, -1) : "0");
    }
  };

  const percent = () => {
    if (calculatedResult !== null) {
      const val = parseFloat(calculatedResult) / 100;
      setExpression(String(val).replace(".", ","));
      setCalculatedResult(null);
    } else {
      const match = expression.match(/(\d+(?:,\d+)?)$/);
      if (match) {
        const num = parseFloat(match[1].replace(",", "."));
        const repl = String(num / 100).replace(".", ",");
        setExpression(
          expression.substring(0, expression.length - match[1].length) + repl,
        );
      }
    }
  };

  const clear = () => {
    setExpression("0");
    setCalculatedResult(null);
  };

  const performOp = (op: string) => {
    let displayOp = op;
    if (op === "*") displayOp = "×";
    if (op === "/") displayOp = "÷";

    if (calculatedResult !== null) {
      setExpression(calculatedResult.replace(".", ",") + displayOp);
      setCalculatedResult(null);
      return;
    }

    const lastChar = expression.slice(-1);
    if (["+", "-", "×", "÷"].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + displayOp);
    } else {
      // Also evaluate intermediate if needed, but the user wants to see the expression!
      setExpression(expression + displayOp);
    }
  };

  const calculate = () => {
    const res = safeEval(expression);
    if (res !== null) {
      const rounded = Math.round(res * 1000000000) / 1000000000;
      setCalculatedResult(String(rounded));
    }
  };

  const formatExpression = (expr: string) => {
    return expr.replace(/\d+(,\d+)?/g, (match) => {
      const parts = match.split(",");
      const intPart = parseInt(parts[0] || "0", 10);
      const formattedInt = isNaN(intPart)
        ? "0"
        : new Intl.NumberFormat("pt-BR").format(intPart);
      if (parts.length > 1) {
        return formattedInt + "," + parts[1];
      }
      return formattedInt;
    });
  };

  const valNum =
    calculatedResult !== null
      ? parseFloat(calculatedResult)
      : safeEval(expression) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#1A1B1E] border border-[#2D2E33] rounded-[16px] flex flex-col overflow-hidden shadow-2xl"
    >
      <div className="p-4 border-b border-[#2D2E33] flex justify-between items-center bg-white/5">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setShowMarkets(!showMarkets);
              setShowConverter(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer active:scale-95 font-bold uppercase tracking-wider text-[11px] ${showMarkets ? "bg-[#3E3F44] text-white" : "text-[#0F0F11]"}`}
            style={!showMarkets ? { backgroundColor: currentTheme } : undefined}
          >
            {showMarkets ? "FECHAR" : "SEJA UM COLABORADOR"}
          </button>
          
          <button
            onClick={() => {
              setShowConverter(!showConverter);
              setShowMarkets(false);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] transition-colors cursor-pointer active:scale-95 font-bold uppercase tracking-wider text-[11px] ${showConverter ? "text-[#0F0F11]" : "bg-[#2D2E33] text-white hover:bg-[#3E3F44]"}`}
            style={showConverter ? { backgroundColor: currentTheme } : undefined}
          >
            <ArrowRightLeft size={14} /> CONVERSOR
          </button>
        </div>
      </div>

      {showConverter ? (
        <div className="p-6 flex flex-col gap-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-bold text-white">Conversor</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setConverterCurrency("USD")}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${converterCurrency === "USD" ? "text-[#0F0F11]" : "bg-[#2D2E33] text-white"}`}
                style={converterCurrency === "USD" ? { backgroundColor: currentTheme } : undefined}
              >
                DÓLAR
              </button>
              <button
                onClick={() => setConverterCurrency("EUR")}
                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-colors ${converterCurrency === "EUR" ? "text-[#0F0F11]" : "bg-[#2D2E33] text-white"}`}
                style={converterCurrency === "EUR" ? { backgroundColor: currentTheme } : undefined}
              >
                EURO
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 bg-black border border-[#2D2E33] rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider">
                  {converterDirection === "BRL_TO_FOREIGN" ? "Real (R$)" : (converterCurrency === "USD" ? "Dólar (US$)" : "Euro (€)")}
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={converterInput}
                  onChange={(e) => setConverterInput(e.target.value.replace(/[^0-9.,]/g, ""))}
                  placeholder="0,00"
                  className="bg-transparent w-full text-center text-2xl font-mono font-bold text-white outline-none"
                  style={{ color: currentTheme }}
                />
              </div>

              <button
                onClick={() => setConverterDirection(d => d === "BRL_TO_FOREIGN" ? "FOREIGN_TO_BRL" : "BRL_TO_FOREIGN")}
                className="w-10 h-10 rounded-full bg-[#2D2E33] hover:bg-[#3E3F44] flex items-center justify-center text-white shrink-0 active:scale-95 transition-all"
              >
                <ArrowRightLeft size={16} />
              </button>

              <div className="flex-1 bg-black border border-[#2D2E33] rounded-xl p-4 flex flex-col items-center justify-center gap-2">
                <span className="text-[#A1A1AA] text-[10px] font-bold uppercase tracking-wider">
                  {converterDirection === "BRL_TO_FOREIGN" ? (converterCurrency === "USD" ? "Dólar (US$)" : "Euro (€)") : "Real (R$)"}
                </span>
                <div className="w-full text-center text-2xl font-mono font-bold truncate text-white">
                  {(() => {
                    const valStr = converterInput.replace(/\./g, "").replace(",", ".");
                    const val = parseFloat(valStr || "0");
                    const rate = rates[converterCurrency] || 1;
                    if (isNaN(val)) return "0,00";
                    if (converterDirection === "BRL_TO_FOREIGN") {
                      return (val / rate).toFixed(2).replace(".", ",");
                    } else {
                      return (val * rate).toFixed(2).replace(".", ",");
                    }
                  })()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-2 bg-white/5 py-2 rounded-lg">
            <span className="text-[11px] font-bold text-[#A1A1AA] uppercase tracking-wider">
              1 {converterCurrency === "USD" ? "Dólar" : "Euro"} = R$ {rates[converterCurrency].toFixed(2).replace(".", ",")}
            </span>
          </div>
          
          <div className="flex justify-center mt-2">
            <button 
              onClick={() => setShowConverter(false)}
              className="px-8 py-3 rounded-xl font-bold text-white bg-[#2D2E33] hover:bg-[#3E3F44] transition-colors cursor-pointer w-full"
            >
              FECHAR
            </button>
          </div>
        </div>
      ) : showMarkets ? (
        <div className="p-6 flex flex-col gap-6">
          <div className="text-center flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--tc)]">💚 Apoie este projeto</h3>
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
              Este aplicativo foi desenvolvido de forma independente com dedicação para ajudar pessoas no dia a dia. Se ele tem sido útil para você, considere fazer uma contribuição voluntária.
            </p>
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
              Sua ajuda contribui para a manutenção, melhorias, novas funcionalidades e atualizações constantes do aplicativo.
            </p>
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
              Muito obrigado pelo seu apoio e por fazer parte deste projeto. 🤝
            </p>
          </div>
          
          <div className="flex gap-3 justify-center mt-2">
            <button 
              onClick={() => setShowMarkets(false)}
              className="px-6 py-3 rounded-xl font-bold text-white bg-[#2D2E33] hover:bg-[#3E3F44] transition-colors cursor-pointer"
            >
              FECHAR
            </button>
            <a 
              href="https://mpago.li/2eBGYCa" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-xl font-bold text-[#0F0F11] hover:opacity-90 transition-opacity flex items-center justify-center"
              style={{ backgroundColor: currentTheme }}
            >
              COLABORE
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-black p-3 text-right border-b border-[#2D2E33]">
            <div className="text-[12px] opacity-50 mb-1 font-mono text-[#A1A1AA] h-4 leading-none">
              {calculatedResult !== null ? formatExpression(expression) : ""}
            </div>
            <div
              className="text-[32px] font-mono overflow-x-auto overflow-y-hidden whitespace-nowrap tracking-tighter leading-none transition-colors"
              style={{ color: currentTheme }}
            >
              {calculatedResult !== null
                ? formatExpression(calculatedResult.replace(".", ","))
                : formatExpression(expression)}
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-4 gap-[8px]">
              {["C", "DEL", "%", "/"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === "C") clear();
                    else if (btn === "DEL") backspace();
                    else if (btn === "%") percent();
                    else performOp(btn);
                  }}
                  className="bg-[#2D2E33] text-[var(--tc)] active:!bg-[var(--tc)] active:!text-[#0F0F11] rounded-[8px] h-[54px] text-[15px] font-bold active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  {btn === "/" ? "÷" : btn}
                </button>
              ))}
              {["7", "8", "9", "*"].map((btn) => (
                <button
                  key={btn}
                  onClick={() =>
                    btn === "*" ? performOp(btn) : inputDigit(btn)
                  }
                  className={`${btn === "*" ? "bg-[#2D2E33] text-[var(--tc)]" : "bg-[#26272B] text-white"} active:!bg-[var(--tc)] active:!text-[#0F0F11] rounded-[8px] h-[54px] text-[18px] font-medium active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none`}
                >
                  {btn === "*" ? "×" : btn}
                </button>
              ))}
              {["4", "5", "6", "-"].map((btn) => (
                <button
                  key={btn}
                  onClick={() =>
                    btn === "-" ? performOp(btn) : inputDigit(btn)
                  }
                  className={`${btn === "-" ? "bg-[#2D2E33] text-[var(--tc)]" : "bg-[#26272B] text-white"} active:!bg-[var(--tc)] active:!text-[#0F0F11] rounded-[8px] h-[54px] text-[18px] font-medium active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none`}
                >
                  {btn}
                </button>
              ))}
              {["1", "2", "3", "+"].map((btn) => (
                <button
                  key={btn}
                  onClick={() =>
                    btn === "+" ? performOp(btn) : inputDigit(btn)
                  }
                  className={`${btn === "+" ? "bg-[#2D2E33] text-[var(--tc)]" : "bg-[#26272B] text-white"} active:!bg-[var(--tc)] active:!text-[#0F0F11] rounded-[8px] h-[54px] text-[18px] font-medium active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none`}
                >
                  {btn}
                </button>
              ))}
              <button
                onClick={() => inputDigit("0")}
                className="col-span-2 bg-[#26272B] text-white active:!bg-[var(--tc)] active:!text-[#0F0F11] rounded-[8px] h-[54px] text-[18px] font-medium active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
              >
                0
              </button>
              <button
                onClick={() => inputComma()}
                className="bg-[#26272B] text-white active:!bg-[var(--tc)] active:!text-[#0F0F11] rounded-[8px] h-[54px] text-[18px] font-medium active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
              >
                ,
              </button>
              <button
                onClick={calculate}
                className="bg-[var(--tc)] text-[#0F0F11] active:!bg-white rounded-[8px] h-[54px] text-[18px] font-bold active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
              >
                =
              </button>
            </div>

            <button
              onClick={() => {
                if (valNum > 0) {
                  onAdd("", "calc", "Adicionado via Calculadora", valNum);
                  clear();
                }
              }}
              disabled={valNum <= 0}
              className="mt-2 bg-transparent border disabled:opacity-30 transition-all font-bold h-[54px] rounded-[8px] flex items-center justify-center cursor-pointer gap-2 text-[14px] uppercase tracking-wide"
              style={
                valNum > 0
                  ? {
                      borderColor: currentTheme,
                      color: currentTheme,
                      backgroundColor: `${currentTheme}1A`,
                    }
                  : {
                      borderColor: currentTheme,
                      color: currentTheme,
                    }
              }
            >
              <Plus size={16} /> ADICIONAR: {format(valNum)}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}

function EditItemForm({
  item,
  form,
  setForm,
  onSave,
  onCancel,
}: {
  item: CartItem;
  form: any;
  setForm: any;
  onSave: any;
  onCancel: any;
}) {
  return (
    <div
      className="flex flex-col gap-2 w-full p-2 bg-[#0F0F11]/80 border border-[var(--tc)]/50 rounded-lg mt-1 mb-1 relative"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        <label className="text-[9px] uppercase text-[#A1A1AA] font-bold tracking-wider">
          Nome do Produto
        </label>
        <input
          type="text"
          autoFocus
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="bg-[#0F0F11] border border-[#2D2E33] text-white text-[13px] px-2 py-1.5 rounded outline-none focus:border-[var(--tc)] transition-colors"
        />
      </div>
      {item.type === "unidade" && (
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] uppercase text-[#A1A1AA] font-bold tracking-wider">
              Qtd
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.quantity}
              onChange={(e) =>
                setForm({
                  ...form,
                  quantity: e.target.value.replace(/\D/g, ""),
                })
              }
              className="bg-[#0F0F11] border border-[#2D2E33] text-white text-[13px] px-2 py-1.5 rounded outline-none focus:border-[var(--tc)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] uppercase text-[#A1A1AA] font-bold tracking-wider">
              Preço Un (R$)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatCurrencyInput(form.unitPrice)}
              onChange={(e) =>
                setForm({
                  ...form,
                  unitPrice: e.target.value.replace(/\D/g, ""),
                })
              }
              className="bg-[#0F0F11] border border-[#2D2E33] text-white text-[13px] px-2 py-1.5 rounded outline-none focus:border-[var(--tc)] transition-colors"
            />
          </div>
        </div>
      )}
      {item.type === "peso" && (
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] uppercase text-[#A1A1AA] font-bold tracking-wider">
              Peso (g)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={form.weight}
              onChange={(e) =>
                setForm({ ...form, weight: e.target.value.replace(/\D/g, "") })
              }
              className="bg-[#0F0F11] border border-[#2D2E33] text-white text-[13px] px-2 py-1.5 rounded outline-none focus:border-[var(--tc)] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[9px] uppercase text-[#A1A1AA] font-bold tracking-wider">
              Preço Kg (R$)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatCurrencyInput(form.unitPrice)}
              onChange={(e) =>
                setForm({
                  ...form,
                  unitPrice: e.target.value.replace(/\D/g, ""),
                })
              }
              className="bg-[#0F0F11] border border-[#2D2E33] text-white text-[13px] px-2 py-1.5 rounded outline-none focus:border-[var(--tc)] transition-colors"
            />
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2 mt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-[6px] bg-[#2D2E33] text-white text-[11px] font-bold hover:bg-[#3E3F44] transition-colors cursor-pointer"
        >
          CANCELA
        </button>
        <button
          onClick={onSave}
          className="px-3 py-1.5 rounded-[6px] bg-[var(--tc)] text-[#0F0F11] text-[11px] font-bold hover:opacity-80 transition-colors cursor-pointer"
        >
          SALVAR
        </button>
      </div>
    </div>
  );
}

function ShoppingList({
  cart,
  history,
  fixedList,
  onUpdateFixedList,
  onRemove,
  onRemoveMultiple,
  onClear,
  onClearHistory,
  onRemoveHistoryItems,
  onUpdateHistoryItem,
  onUpdateCartItem,
  onFinish,
  format,
  onScan,
}: {
  cart: CartItem[];
  history: Purchase[];
  fixedList: FixedItem[];
  onUpdateFixedList: any;
  onRemove: any;
  onRemoveMultiple: any;
  onClear: any;
  onClearHistory: any;
  onRemoveHistoryItems: (ids: string[]) => void;
  onUpdateHistoryItem: any;
  onUpdateCartItem: any;
  onFinish: any;
  format: any;
  onScan: (name: string) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"current" | "history" | "fixed">("current");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [newFixedItem, setNewFixedItem] = useState("");
  const [editingItem, setEditingItem] = useState<{
    isCart: boolean;
    purchaseId?: string;
    itemId: string;
  } | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    quantity?: string;
    weight?: string;
    unitPrice?: string;
  }>({ name: "" });

  const startEditing = (
    item: CartItem,
    isCart: boolean,
    purchaseId?: string,
  ) => {
    let parsedQty = item.quantity?.toString() || "";
    let parsedWeight = item.weight?.toString() || "";
    let parsedPriceDigits = "";

    if (item.unitPrice !== undefined) {
      parsedPriceDigits = Math.round(item.unitPrice * 100).toString();
    }

    if (
      !item.quantity &&
      !item.weight &&
      item.unitPrice === undefined &&
      item.details
    ) {
      if (item.type === "unidade") {
        const m = item.details.match(/^(\d+)x\s+@\s+.*?([\d,\.]+)\/un/);
        if (m) {
          parsedQty = m[1];
          const priceFloat = parseFloat(
            m[2].replace(/\./g, "").replace(",", "."),
          );
          parsedPriceDigits = Math.round(priceFloat * 100).toString();
        }
      } else if (item.type === "peso") {
        const m = item.details.match(/^(\d+)g\s+@\s+.*?([\d,\.]+)\/kg/);
        if (m) {
          parsedWeight = m[1];
          const priceFloat = parseFloat(
            m[2].replace(/\./g, "").replace(",", "."),
          );
          parsedPriceDigits = Math.round(priceFloat * 100).toString();
        }
      }
    }

    setEditingItem({ isCart, purchaseId, itemId: item.id });
    setEditForm({
      name: item.name,
      quantity: parsedQty,
      weight: parsedWeight,
      unitPrice: parsedPriceDigits,
    });
  };

  const saveEdit = (item: CartItem) => {
    if (!editingItem) return;
    let updatedDetails = item.details;
    let updatedValue = item.value;
    let updatedQty = item.quantity;
    let updatedW = item.weight;
    let updatedP = item.unitPrice;

    if (item.type === "unidade" && editForm.quantity && editForm.unitPrice) {
      updatedQty = parseInt(editForm.quantity.replace(/\D/g, ""));
      updatedP = parseInt(editForm.unitPrice) / 100;
      if (!isNaN(updatedQty) && !isNaN(updatedP)) {
        updatedValue = updatedP * updatedQty;
        updatedDetails = `${updatedQty}x @ ${format(updatedP)}/un`;
      }
    } else if (item.type === "peso" && editForm.weight && editForm.unitPrice) {
      updatedW = parseInt(editForm.weight.replace(/\D/g, ""));
      updatedP = parseInt(editForm.unitPrice) / 100;
      if (!isNaN(updatedW) && !isNaN(updatedP)) {
        updatedValue = updatedP * (updatedW / 1000);
        updatedDetails = `${updatedW}g @ ${format(updatedP)}/kg`;
      }
    }

    const updates = {
      name: editForm.name.trim() || item.name,
      details: updatedDetails,
      value: updatedValue,
      quantity: updatedQty,
      weight: updatedW,
      unitPrice: updatedP,
    };

    if (editingItem.isCart) {
      onUpdateCartItem(editingItem.itemId, updates);
    } else if (editingItem.purchaseId) {
      onUpdateHistoryItem(editingItem.purchaseId, editingItem.itemId, updates);
    }
    setEditingItem(null);
  };

  const handleAddFixedItem = () => {
    if (!newFixedItem.trim()) return;
    onUpdateFixedList([
      ...fixedList,
      { id: Date.now().toString(), name: newFixedItem.trim(), checked: false },
    ]);
    setNewFixedItem("");
  };

  const toggleFixedItem = (id: string) => {
    onUpdateFixedList(
      fixedList.map((item: FixedItem) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const removeFixedItem = (id: string) => {
    onUpdateFixedList(fixedList.filter((item: FixedItem) => item.id !== id));
  };

  const handleScanResult = async (barcode: string) => {
    setScanning(false);
    setLoading(true);
    try {
      const res = await fetch(
        `https://br.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );
      const data = await res.json();
      if (data && data.product && data.product.product_name) {
        onScan(data.product.product_name);
      } else {
        alert(
          "Produto não encontrado na base. Adicionando o código ao invés do nome.",
        );
        onScan(barcode);
      }
    } catch (e) {
      alert("Erro ao buscar produto. Adicionando o código ao invés do nome.");
      onScan(barcode);
    }
    setLoading(false);
  };

  if (scanning) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-[#1A1B1E] border border-[#2D2E33] rounded-[16px] flex flex-col overflow-hidden shadow-2xl p-4 gap-4"
      >
        <span className="text-[12px] font-semibold uppercase tracking-[0.05em] text-[#A1A1AA] text-center">
          Escaneando Código...
        </span>
        <BarcodeScanner
          onResult={handleScanResult}
          onCancel={() => setScanning(false)}
        />
      </motion.div>
    );
  }

  const filteredHistory = history.filter((p) => {
    if (!search) return true;
    const s = search.toLowerCase();
    const dateStr = new Date(p.timestamp)
      .toLocaleDateString("pt-BR")
      .toLowerCase();
    const matchesItems = p.items.some((item) =>
      item.name.toLowerCase().includes(s),
    );
    return dateStr.includes(s) || matchesItems;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-[#1A1B1E] border border-[#2D2E33] rounded-[16px] flex flex-col overflow-hidden shadow-2xl relative pb-2"
    >
      <div className="p-2 border-b border-[#2D2E33] flex justify-between items-center bg-white/5">
        <div className="flex bg-[#0F0F11] rounded-[8px] p-1 gap-1">
          <button
            onClick={() => setView("current")}
            className={`px-3 py-1.5 rounded-[6px] text-[11px] font-bold uppercase transition-colors ${view === "current" ? "bg-[#2D2E33] text-white" : "text-[#A1A1AA] hover:text-white"}`}
          >
            Atual ({cart.length})
          </button>
          <button
            onClick={() => setView("history")}
            className={`px-3 py-1.5 rounded-[6px] text-[11px] font-bold uppercase transition-colors ${view === "history" ? "bg-[#2D2E33] text-white" : "text-[#A1A1AA] hover:text-white"}`}
          >
            Histórico ({history.length})
          </button>
          <button
            onClick={() => {
              if (selectedItems.length > 0) {
                const newFixedItems = cart
                  .filter((item) => selectedItems.includes(item.id))
                  .filter(
                    (item) =>
                      !fixedList.some(
                        (f) => f.name.toLowerCase() === item.name.toLowerCase(),
                      ),
                  )
                  .map((item) => ({
                    id: Date.now().toString() + Math.random().toString(),
                    name: item.name,
                    checked: false,
                  }));

                if (newFixedItems.length > 0) {
                  onUpdateFixedList([...fixedList, ...newFixedItems]);
                }
                setSelectedItems([]);
              }
              setView("fixed");
            }}
            className={`px-3 py-1.5 rounded-[6px] text-[11px] font-bold uppercase transition-colors ${view === "fixed" ? "bg-[#2D2E33] text-white" : "text-[#A1A1AA] hover:text-white"}`}
          >
            Fixa
          </button>
        </div>
        {view === "current" ? (
          <div className="flex bg-[#0F0F11] rounded-[8px] p-1 gap-1 mr-1">
            <button
              onClick={() => {
                if (selectedItems.length === cart.length && cart.length > 0) {
                  setSelectedItems([]);
                } else {
                  setSelectedItems(cart.map((item) => item.id));
                }
              }}
              className="text-[var(--tc)] hover:text-[#A8E659] flex items-center justify-center p-2 transition-colors"
              title="Selecionar Tudo"
            >
              {selectedItems.length === cart.length && cart.length > 0 ? (
                <CheckSquare size={18} />
              ) : (
                <Square size={18} />
              )}
            </button>
            <button
              onClick={() => setScanning(true)}
              className="text-[var(--tc)] hover:text-[#A8E659] flex items-center justify-center p-2 transition-colors"
              title="Escanear Código de Barras"
            >
              <Barcode size={18} />
            </button>
          </div>
        ) : view === "history" ? (
          history.length > 0 && (
            <button
              onClick={() => {
                if (selectedHistoryIds.length > 0) {
                  onRemoveHistoryItems(selectedHistoryIds);
                  setSelectedHistoryIds([]);
                } else {
                  onClearHistory();
                }
              }}
              className={`${selectedHistoryIds.length > 0 ? "text-[#FF5555]" : "text-[#A1A1AA] hover:text-[#FF5555]"} flex items-center justify-center p-2 mr-1 transition-colors`}
              title={selectedHistoryIds.length > 0 ? `Apagar selecionados (${selectedHistoryIds.length})` : "Apagar Todo o Histórico"}
            >
              <Trash2 size={16} />
            </button>
          )
        ) : null}
      </div>

      {view === "current" && (
        <div className="p-3 flex flex-col gap-[8px]">
          {loading && (
            <div className="flex justify-center p-4">
              <div className="w-6 h-6 rounded-full border-2 border-[var(--tc)] border-t-transparent animate-spin" />
            </div>
          )}
          {cart.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-10 text-[#A1A1AA] space-y-4">
              <ShoppingCart size={48} className="opacity-20" />
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                Carrinho Vazio
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setScanning(true);
                }}
                className="relative z-10 cursor-pointer active:scale-95 mt-4 flex items-center justify-center gap-2 bg-[#2D2E33] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#323338] transition-all text-[13px] uppercase tracking-wider"
              >
                <Barcode size={18} /> Escanear Código
              </button>
            </div>
          )}
          {cart.map((item, index) => {
            const isSelected = selectedItems.includes(item.id);
            return (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                key={item.id}
                className={`flex items-center justify-between bg-white/[0.03] border-l-[3px] p-2 rounded-[8px] transition-colors ${isSelected ? "border-[var(--tc)] bg-white/[0.08]" : "border-transparent"}`}
              >
                <button
                  onClick={() => {
                    if (isSelected) {
                      setSelectedItems(
                        selectedItems.filter((id) => id !== item.id),
                      );
                    } else {
                      setSelectedItems([...selectedItems, item.id]);
                    }
                  }}
                  className="p-2 text-[#A1A1AA] hover:text-white transition-colors"
                >
                  {isSelected ? (
                    <CheckSquare size={18} className="text-[var(--tc)]" />
                  ) : (
                    <Square size={18} />
                  )}
                </button>
                <div className="flex-1 min-w-0 pr-4 pl-1">
                  {editingItem?.isCart && editingItem?.itemId === item.id ? (
                    <EditItemForm
                      item={item}
                      form={editForm}
                      setForm={setEditForm}
                      onSave={() => saveEdit(item)}
                      onCancel={() => setEditingItem(null)}
                    />
                  ) : (
                    <div className="group flex items-center gap-2">
                      <div className="flex flex-col min-w-0">
                        <h3 className="font-semibold text-[14px] text-white truncate">
                          {item.name}
                        </h3>
                        <p className="text-[12px] text-[#A1A1AA] truncate">
                          {item.details}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(item, true);
                        }}
                        className="text-[#A1A1AA] hover:text-[var(--tc)] transition-colors cursor-pointer active:scale-95 px-1 py-1 -ml-1"
                        title="Editar Item"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[16px] text-white whitespace-nowrap">
                    {format(item.value)}
                  </span>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-[#A1A1AA] hover:text-[#FF5555] p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}

          {cart.length > 0 && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (selectedItems.length > 0) {
                    onRemoveMultiple(selectedItems);
                    setSelectedItems([]);
                  } else {
                    onClear();
                  }
                }}
                className={`flex-1 h-[48px] bg-transparent border text-[#A1A1AA] hover:text-white rounded-[8px] font-semibold text-[12px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${selectedItems.length > 0 ? "border-[#FF5555] hover:border-[#FF5555] text-[#FF5555] hover:text-[#FF5555] hover:bg-[#FF5555]/10" : "border-[#2D2E33] hover:border-[#A1A1AA]"}`}
              >
                <Trash2 size={16} />{" "}
                {selectedItems.length > 0
                  ? `Apagar (${selectedItems.length})`
                  : "Limpar"}
              </button>
              <button
                onClick={onFinish}
                className="flex-[2] h-[48px] bg-[var(--tc)] text-[#0F0F11] hover:bg-[#A8E659] rounded-[8px] font-bold text-[12px] uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} /> Finalizar Feira
              </button>
            </div>
          )}
        </div>
      )}

      {view === "history" && (
        <div className="p-3 flex flex-col gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por data ou item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black border border-[#2D2E33] rounded-[8px] pl-9 pr-3 py-2 text-[14px] text-white outline-none focus:border-[var(--tc)] transition-colors placeholder:text-[#2D2E33]"
            />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#A1A1AA] space-y-4">
              <Clock size={48} className="opacity-20" />
              <p className="text-[12px] font-bold uppercase tracking-widest text-[#A1A1AA]">
                Nenhum histórico
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 relative">
              {filteredHistory.map((purchase) => {
                const date = new Date(purchase.timestamp);
                const isExpanded = expandedId === purchase.id;
                const isSelected = selectedHistoryIds.includes(purchase.id);
                
                return (
                  <motion.div
                    key={purchase.id}
                    className={`bg-white/[0.03] border ${isSelected ? 'border-[#FF5555]' : 'border-[#2D2E33]'} rounded-[8px] overflow-hidden flex flex-col transition-colors`}
                  >
                    <button
                      onPointerDown={() => {
                        const timer = setTimeout(() => {
                          if (!selectedHistoryIds.includes(purchase.id)) {
                            setSelectedHistoryIds([...selectedHistoryIds, purchase.id]);
                          }
                        }, 500);
                        (window as any)[`longPressTimer_${purchase.id}`] = timer;
                      }}
                      onPointerUp={() => {
                        clearTimeout((window as any)[`longPressTimer_${purchase.id}`]);
                      }}
                      onPointerLeave={() => {
                        clearTimeout((window as any)[`longPressTimer_${purchase.id}`]);
                      }}
                      onPointerCancel={() => {
                        clearTimeout((window as any)[`longPressTimer_${purchase.id}`]);
                      }}
                      onClick={() => {
                        if (selectedHistoryIds.length > 0) {
                          if (isSelected) {
                            setSelectedHistoryIds(selectedHistoryIds.filter(id => id !== purchase.id));
                          } else {
                            setSelectedHistoryIds([...selectedHistoryIds, purchase.id]);
                          }
                        } else {
                          setExpandedId(isExpanded ? null : purchase.id);
                        }
                      }}
                      className={`p-3 flex justify-between items-center text-left hover:bg-white/5 transition-colors ${isSelected ? 'bg-[#FF5555]/10' : ''}`}
                      style={{ WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}
                    >
                      <div>
                        <div className="font-semibold text-white text-[14px]">
                          {date.toLocaleDateString("pt-BR")}{" "}
                          <span className="opacity-50 font-normal text-[12px]">
                            às{" "}
                            {date.toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-[12px] text-[#A1A1AA]">
                          {purchase.items.length} itens
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-[var(--tc)] font-bold">
                          {format(purchase.total)}
                        </span>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-[#A1A1AA]" />
                        ) : (
                          <ChevronDown size={16} className="text-[#A1A1AA]" />
                        )}
                      </div>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-black/50 border-t border-[#2D2E33] px-3 py-2 flex flex-col gap-2"
                        >
                          {purchase.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between items-center py-2 border-b border-[#2D2E33]/50 last:border-0 relative"
                            >
                              <div className="flex-1 pr-2 min-w-0">
                                {editingItem?.purchaseId === purchase.id &&
                                editingItem?.itemId === item.id ? (
                                  <EditItemForm
                                    item={item}
                                    form={editForm}
                                    setForm={setEditForm}
                                    onSave={() => saveEdit(item)}
                                    onCancel={() => setEditingItem(null)}
                                  />
                                ) : (
                                  <div className="group flex items-center gap-2">
                                    <div className="text-[12px] font-semibold text-white truncate">
                                      {item.name}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startEditing(item, false, purchase.id);
                                      }}
                                      className="text-[#A1A1AA] hover:text-white transition-colors cursor-pointer active:scale-95 px-1 py-1 -ml-1"
                                      title="Editar Item"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                  </div>
                                )}
                                <div className="text-[10px] text-[#A1A1AA]">
                                  {item.details}
                                </div>
                              </div>
                              <div className="text-[12px] font-mono text-[#A1A1AA]">
                                {format(item.value)}
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "fixed" && (
        <div className="p-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newFixedItem}
              onChange={(e) => setNewFixedItem(e.target.value)}
              placeholder="Novo item fixo..."
              className="flex-1 bg-black border border-[#2D2E33] rounded-[8px] px-3 py-2 text-[14px] text-white outline-none focus:border-[var(--tc)] transition-colors"
              onKeyDown={(e) => e.key === "Enter" && handleAddFixedItem()}
            />
            <button
              onClick={handleAddFixedItem}
              className="bg-[var(--tc)] text-[#0F0F11] px-4 rounded-[8px] font-bold active:scale-95 transition-all flex items-center justify-center"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {fixedList.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-[8px] border-l-[3px] transition-colors cursor-pointer select-none ${item.checked ? "border-[var(--tc)] bg-[var(--tc)]/10 text-[var(--tc)]" : "border-[#2D2E33] bg-white/[0.03] text-white"}`}
                onClick={() => toggleFixedItem(item.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                  {item.checked ? (
                    <CheckCircle size={18} className="shrink-0" />
                  ) : (
                    <div className="w-[18px] h-[18px] rounded-full border-2 border-[#A1A1AA] shrink-0" />
                  )}
                  <span
                    className={`font-semibold text-[14px] truncate ${item.checked ? "line-through opacity-70 cursor-default" : ""}`}
                  >
                    {item.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFixedItem(item.id);
                  }}
                  className="text-[#A1A1AA] hover:text-[#FF5555] p-2 -mr-2 transition-colors rounded-lg hover:bg-white/5"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {fixedList.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-[#A1A1AA] space-y-4">
                <ListIcon size={48} className="opacity-20" />
                <p className="text-[12px] font-bold uppercase tracking-widest text-[#A1A1AA] text-center leading-relaxed">
                  Nenhum item fixo
                  <br />
                  adicionado
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function BarcodeScanner({
  onResult,
  onCancel,
}: {
  onResult: (code: string) => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader", {
      verbose: false,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.CODE_39,
      ],
    });
    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
        },
        (decodedText) => {
          if (html5QrCode.isScanning) {
            html5QrCode
              .stop()
              .then(() => {
                onResult(decodedText);
              })
              .catch(console.error);
          }
        },
        (errorMessage) => {
          // quiet fail
        },
      )
      .catch((err) => {
        console.log(err);
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [onResult]);

  return (
    <div className="flex flex-col gap-4">
      <div
        id="reader"
        className="w-full bg-black rounded-lg overflow-hidden border border-[#2D2E33] min-h-[250px]"
      ></div>
      <p className="text-[#A1A1AA] text-[11px] text-center leading-relaxed px-4">
        Ao focar no código, mantenha a câmera parada e com boa iluminação.
        <br />
        Se o produto não existir na base, o próprio código será adicionado como
        nome.
      </p>
      <button
        onClick={onCancel}
        className="w-full bg-[#2D2E33] text-white py-3 rounded-lg font-bold"
      >
        Cancelar
      </button>
    </div>
  );
}
