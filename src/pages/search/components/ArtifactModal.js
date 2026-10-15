import { Drawer } from '~/components/ui/Drawer';
import { Dialog } from '~/components/ui/Dialog';
import { useDimensions } from '~/hooks/useDimensions';

export default function ArtifactModal(props) {
  const is_wide = useDimensions((dimensions) => dimensions.width > 640);
  const title = <span>Add artefact</span>;
  const description = (
    <span>
      Include another artifact in your search, results will contain <b>all</b> artefacts you selected.
    </span>
  );

  if (is_wide) {
    return (
      <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
        <Dialog.Trigger asChild>{props.trigger}</Dialog.Trigger>

        <Dialog.Content className="max-h-[80vh] max-w-[80vw] overflow-hidden flex flex-col p-0">
          <div className="ps-4 pe-3 pt-6">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Description className="pe-16">{description}</Dialog.Description>
          </div>

          <div className="overflow-scroll ps-4 pe-3 pb-2">{props.children}</div>
        </Dialog.Content>
      </Dialog.Root>
    );
  }

  return (
    <Drawer.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Drawer.Trigger asChild>{props.trigger}</Drawer.Trigger>

      <Drawer.Content className="max-h-[80vh]">
        <div className="ps-2 pe-1 pb-1">
          <Drawer.Title>{title}</Drawer.Title>
          <Drawer.Description>{description}</Drawer.Description>
        </div>

        <div className="min-h-2" />

        <div className="overflow-scroll ps-2 pe-1 pb-1">{props.children}</div>
      </Drawer.Content>
    </Drawer.Root>
  );
}
