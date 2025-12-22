const Input = ({ label, type, name, value, onChange, required }) => (
    <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>{label}:</label>
        <input 
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
        />
    </div>
);

export default Input;