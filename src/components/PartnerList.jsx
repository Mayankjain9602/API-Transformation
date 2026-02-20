const PartnerList = ({ partners, onSelect }) => {
  return (
    <ul>
      {partners.map((p) => (
        <li key={p.id} onClick={() => onSelect(p)}>
          {p.name}
        </li>
      ))}
    </ul>
  );
};

export default PartnerList;
