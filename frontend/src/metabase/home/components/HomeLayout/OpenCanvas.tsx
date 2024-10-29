import { Canvas } from "metabase/query_builder/components/Canvas/Canvas";


export const OpenCanvas = () => {

  return (
    <div className="flex flex-col items-center justify-center h-full">
            <Canvas user={{id: '1'}} />
    </div>
  );
};