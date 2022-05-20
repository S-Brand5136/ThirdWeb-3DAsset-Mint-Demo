import "@google/model-viewer";

type Props = {
  src: string;
  posterSrc: string;
};

function Model({ src, posterSrc }: Props) {
  return (
    <div>
      {/* @ts-ignore */}
      <model-viewer
        src={src}
        ar
        ar-modes='webxr scene-viewer quick-look'
        poster={posterSrc}
        camera-controls
        environment-image='neutral'
        shadow-intensity='1'
      >
        {/* @ts-ignore */}
      </model-viewer>
    </div>
  );
}

export default Model;
