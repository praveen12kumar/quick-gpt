// utils/CombineContext.jsx
export default function combineContext(...Providers) {
  return function CombinedProviders({ children }) {
    return Providers.reduceRight((acc, Provider) => {
      return <Provider>{acc}</Provider>;
    }, children);
  };
}
