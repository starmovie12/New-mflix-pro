import { WatchClient } from "@/components/WatchClient";

type WatchPageProps = {
  params: {
    id: string;
  };
};

export default function WatchPage({ params }: WatchPageProps) {
  return <WatchClient id={decodeURIComponent(params.id)} />;
}
