import React, { useState } from 'react';
import { LocationPoint, DeliveryDetails, DeliveryItemCategory, PaymentMethod, RideCategory } from '../types';
import { RIDE_CATEGORIES } from '../data/provinces';
import { 
  UtensilsCrossed, 
  Package, 
  ShoppingBag, 
  Pill, 
  ShieldCheck, 
  Eye, 
  AlertCircle, 
  ArrowRight, 
  Banknote, 
  Smartphone, 
  CreditCard,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface DeliveryBookingPanelProps {
  availableLocations: LocationPoint[];
  pickup: LocationPoint;
  destination: LocationPoint;
  onPickupChange: (loc: LocationPoint) => void;
  onDestinationChange: (loc: LocationPoint) => void;
  distanceKm: number;
  durationMin: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  onRequestDelivery: (details: DeliveryDetails, category: RideCategory, fareZAR: number) => void;
  isOffline: boolean;
}

export const DeliveryBookingPanel: React.FC<DeliveryBookingPanelProps> = ({
  availableLocations,
  pickup,
  destination,
  onPickupChange,
  onDestinationChange,
  distanceKm,
  durationMin,
  paymentMethod,
  onPaymentMethodChange,
  onRequestDelivery,
  isOffline,
}) => {
  const [itemCategory, setItemCategory] = useState<DeliveryItemCategory>('food_meals');
  const [itemDescription, setItemDescription] = useState('Hot Shisanyama & Braai Platter');
  const [recipientName, setRecipientName] = useState('Bheki Ndlovu');
  const [recipientPhone, setRecipientPhone] = useState('+27 84 920 1144');
  const [weightKg, setWeightKg] = useState(3.5);
  const [isInsulatedBagRequired, setIsInsulatedBagRequired] = useState(true);
  const [viewObstructionConfirmed, setViewObstructionConfirmed] = useState(true);
  const [showPicker, setShowPicker] = useState<'pickup' | 'dest' | null>(null);

  // Delivery categories
  const deliveryCategories = RIDE_CATEGORIES.filter((c) => c.isDeliveryOnly);
  const selectedCat = itemCategory === 'food_meals' ? deliveryCategories[0] : deliveryCategories[1];

  const estimatedFareZAR = Math.max(
    selectedCat.baseFareZAR,
    Math.round(selectedCat.baseFareZAR + distanceKm * selectedCat.perKmZAR + durationMin * selectedCat.perMinuteZAR)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewObstructionConfirmed) {
      alert('Please confirm that the item will be stowed without obstructing the driver or other motorists.');
      return;
    }

    const details: DeliveryDetails = {
      itemCategory,
      itemDescription,
      recipientName,
      recipientPhone,
      weightKg,
      isInsulatedBagRequired: itemCategory === 'food_meals' ? isInsulatedBagRequired : false,
      viewObstructionCompliant: true,
      deliveryNotes: `Stowed in boot/footwell below window level. Contact recipient ${recipientName} on arrival.`,
    };

    onRequestDelivery(details, selectedCat, estimatedFareZAR);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 overflow-y-auto">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Safe Food & Item Delivery</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Reliable local courier across Newcastle & South Africa
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            {distanceKm} km · ~{durationMin} min
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 space-y-4">
        {/* Category selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">What are you sending?</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setItemCategory('food_meals');
                setItemDescription('Hot Meal / Restaurant Order');
                setIsInsulatedBagRequired(true);
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                itemCategory === 'food_meals'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold">Food & Meals</div>
                <div className="text-[10px] text-slate-400">Insulated thermal carry</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setItemCategory('documents_parcels');
                setItemDescription('Boxed Parcel / Documents');
                setIsInsulatedBagRequired(false);
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                itemCategory === 'documents_parcels'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="font-bold">Parcels & Goods</div>
                <div className="text-[10px] text-slate-400">Keys, boxes, electronics</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setItemCategory('groceries');
                setItemDescription('Fresh Groceries & Produce');
                setIsInsulatedBagRequired(false);
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                itemCategory === 'groceries'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold">Groceries</div>
                <div className="text-[10px] text-slate-400">Supermarket bags</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setItemCategory('pharmacy_meds');
                setItemDescription('Pharmacy Prescription & Meds');
                setIsInsulatedBagRequired(false);
              }}
              className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                itemCategory === 'pharmacy_meds'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Pill className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="font-bold">Pharmacy</div>
                <div className="text-[10px] text-slate-400">Urgent medicines</div>
              </div>
            </button>
          </div>
        </div>

        {/* Pickup & Destination selection */}
        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Sender / Restaurant:</span>
              <button
                type="button"
                onClick={() => setShowPicker(showPicker === 'pickup' ? null : 'pickup')}
                className="text-amber-400 hover:underline font-semibold truncate max-w-[200px]"
              >
                {pickup.name}
              </button>
            </div>

            {showPicker === 'pickup' && (
              <div className="max-h-40 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg p-1">
                {availableLocations.map((loc) => (
                  <button
                    key={`p-${loc.id}`}
                    type="button"
                    onClick={() => {
                      onPickupChange(loc);
                      setShowPicker(null);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-slate-800 text-[11px] truncate block"
                  >
                    {loc.name} ({loc.suburbOrDistrict})
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-700">
              <span className="text-slate-400">Delivery Drop-off:</span>
              <button
                type="button"
                onClick={() => setShowPicker(showPicker === 'dest' ? null : 'dest')}
                className="text-amber-400 hover:underline font-semibold truncate max-w-[200px]"
              >
                {destination.name}
              </button>
            </div>

            {showPicker === 'dest' && (
              <div className="max-h-40 overflow-y-auto bg-slate-900 border border-slate-700 rounded-lg p-1">
                {availableLocations.map((loc) => (
                  <button
                    key={`d-${loc.id}`}
                    type="button"
                    onClick={() => {
                      onDestinationChange(loc);
                      setShowPicker(null);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-slate-800 text-[11px] truncate block"
                  >
                    {loc.name} ({loc.suburbOrDistrict})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Item & Recipient Details */}
        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Item Description</label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              placeholder="e.g. 2x Burgers and fries, pharmacy package, documents"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Recipient Name</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Recipient Cell Phone</label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>
        </div>

        {/* MANDATORY ROAD SAFETY & OBSTRUCTION COMPLIANCE ACCORDION */}
        <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Eye className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Driver Sightline & View Safety Guarantee</span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            In compliance with the South African National Road Traffic Act: All items are securely stowed in the vehicle boot or floor footwell, strictly below window line height, ensuring 100% unobstructed view for the driver and other motorists.
          </p>

          <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={viewObstructionConfirmed}
              onChange={(e) => setViewObstructionConfirmed(e.target.checked)}
              className="mt-0.5 rounded border-slate-600 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span className="text-[11px] text-white font-medium select-none">
              I verify this item is safely sized, non-hazardous, and will not obstruct the driver’s rear-view mirror or side windows.
            </span>
          </label>
        </div>

        {/* Payment selector */}
        <div className="pt-1">
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Payment Method</label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => onPaymentMethodChange('cash')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                paymentMethod === 'cash' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Cash at Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => onPaymentMethodChange('ozow')}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                paymentMethod === 'ozow' ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>Ozow / Instant EFT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Submit */}
      <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 sticky bottom-0 z-20">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400">Total Delivery Fee</span>
          <span className="text-xl font-black text-white font-mono">R{estimatedFareZAR}</span>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition cursor-pointer"
        >
          <span>Dispatch Safe Courier (R{estimatedFareZAR})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};
