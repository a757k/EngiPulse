export default function CategoryBar({
  categories,
  selected,
  setSelected
}) {
  return (
    <div className="category-bar">
      {categories.map((category) => (
        <button
          key={category}
          className={
            selected === category
              ? "category active"
              : "category"
          }
          onClick={() => setSelected(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
