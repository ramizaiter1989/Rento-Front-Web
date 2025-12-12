const onlyDigits = (v) => v.replace(/\D/g, "");

export const PhoneRow = ({ countries, iso2, setIso2, phone, setPhone, disabledPhone }) => {
  return (
    <div className="flex gap-2 w-full">
      <select
        value={iso2}
        onChange={(e) => setIso2(e.target.value)}
        className="w-[140px] sm:w-[190px] shrink-0 bg-white text-black p-2 border rounded"
      >
        {countries.map((c) => (
          <option key={c.iso2} value={c.iso2}>
            {c.name} ({c.dialCode})
          </option>
        ))}
      </select>

      <input
        type="tel"
        inputMode="numeric"
        value={phone}
        onChange={(e) => setPhone(onlyDigits(e.target.value))}
        placeholder="70123456"
        className="flex-1 pl-2 border rounded text-black"
        disabled={disabledPhone}
      />
    </div>
  );
};