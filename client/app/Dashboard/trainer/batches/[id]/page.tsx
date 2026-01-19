import BatchDetails from "@/app/Components/Dashboard/Trainer/BatchDetails";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  return <BatchDetails batchId={resolvedParams.id} />;
}
