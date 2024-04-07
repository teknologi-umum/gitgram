import { Subject, bufferTime, distinctUntilKeyChanged, groupBy, mergeMap } from "rxjs";
import { describe, it, expect } from "vitest";
import { MessageData } from "~/application/interfaces/IPresenter";

const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Velit laoreet id donec ultrices. Sed cras ornare arcu dui vivamus arcu. At consectetur lorem donec massa sapien faucibus et molestie. Quis vel eros donec ac odio tempor orci dapibus. Arcu cursus euismod quis viverra nibh cras pulvinar mattis. Volutpat sed cras ornare arcu dui vivamus arcu felis. Dictum non consectetur a erat nam. Dolor morbi non arcu risus quis. Sit amet nisl purus in mollis nunc. Tempus urna et pharetra pharetra. Amet nulla facilisi morbi tempus.

Platea dictumst quisque sagittis purus. In nulla posuere sollicitudin aliquam ultrices sagittis. Nisl tincidunt eget nullam non nisi est sit amet. Metus vulputate eu scelerisque felis. Morbi tristique senectus et netus et malesuada fames ac. Pellentesque dignissim enim sit amet venenatis urna cursus eget. Eu tincidunt tortor aliquam nulla facilisi cras fermentum odio. Purus ut faucibus pulvinar elementum integer enim. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Ipsum suspendisse ultrices gravida dictum fusce ut placerat orci nulla. Id velit ut tortor pretium.

Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Nam libero justo laoreet sit amet cursus. Rhoncus mattis rhoncus urna neque viverra justo. Posuere ac ut consequat semper viverra. Molestie at elementum eu facilisis sed odio morbi. Vestibulum lectus mauris ultrices eros. Maecenas ultricies mi eget mauris pharetra et ultrices neque ornare. Ante in nibh mauris cursus. Ut pharetra sit amet aliquam id diam maecenas. Quis viverra nibh cras pulvinar. Adipiscing elit pellentesque habitant morbi tristique senectus. Aliquet lectus proin nibh nisl. Iaculis urna id volutpat lacus laoreet non curabitur. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Quis eleifend quam adipiscing vitae. Arcu cursus euismod quis viverra nibh cras pulvinar.

Suspendisse ultrices gravida dictum fusce ut placerat orci nulla. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Ut eu sem integer vitae. Massa ultricies mi quis hendrerit dolor magna. Euismod elementum nisi quis eleifend quam adipiscing vitae proin. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Nulla pellentesque dignissim enim sit amet venenatis. Viverra ipsum nunc aliquet bibendum enim. Vivamus at augue eget arcu dictum varius. Purus in mollis nunc sed id semper risus in. In arcu cursus euismod quis viverra nibh cras pulvinar mattis. Commodo elit at imperdiet dui accumsan. Dictum sit amet justo donec enim diam vulputate ut pharetra.

Tortor id aliquet lectus proin nibh. Aliquam faucibus purus in massa tempor. Euismod in pellentesque massa placerat duis ultricies lacus sed turpis. Vitae proin sagittis nisl rhoncus mattis rhoncus. Porta non pulvinar neque laoreet suspendisse interdum consectetur libero. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus. Mauris pellentesque pulvinar pellentesque habitant morbi. Donec pretium vulputate sapien nec. At imperdiet dui accumsan sit amet nulla facilisi morbi tempus. Odio ut enim blandit volutpat maecenas volutpat. Parturient montes nascetur ridiculus mus. Imperdiet dui accumsan sit amet nulla. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt. Lectus mauris ultrices eros in cursus turpis. Ut etiam sit amet nisl purus in mollis nunc. Viverra vitae congue eu consequat ac felis. Faucibus vitae aliquet nec ullamcorper sit amet risus. Sagittis vitae et leo duis. Nunc aliquet bibendum enim facilisis gravida. Scelerisque in dictum non consectetur a erat nam at.

Euismod in pellentesque massa placerat duis. Non odio euismod lacinia at quis risus sed vulputate odio. Cursus turpis massa tincidunt dui ut ornare. Aenean et tortor at risus viverra adipiscing. Molestie at elementum eu facilisis sed odio morbi quis commodo. Parturient montes nascetur ridiculus mus mauris vitae ultricies leo integer. Ornare suspendisse sed nisi lacus. Condimentum vitae sapien pellentesque habitant morbi. Viverra mauris in aliquam sem fringilla ut morbi tincidunt augue. Pellentesque elit eget gravida cum sociis natoque penatibus. Ante in nibh mauris cursus mattis molestie a iaculis. Nibh tortor id aliquet lectus proin. Id porta nibh venenatis cras. Fames ac turpis egestas integer eget aliquet. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus.

Maecenas pharetra convallis posuere morbi leo urna molestie at. Dapibus ultrices in iaculis nunc sed augue. Pharetra vel turpis nunc eget lorem dolor sed viverra. Mollis nunc sed id semper risus. Placerat orci nulla pellentesque dignissim enim sit amet venenatis. Odio ut sem nulla pharetra diam. Dapibus ultrices in iaculis nunc sed. Tristique senectus et netus et malesuada fames ac. Lectus urna duis convallis convallis tellus id. Elementum eu facilisis sed odio morbi quis commodo odio aenean. Ornare massa eget egestas purus. Dapibus ultrices in iaculis nunc sed augue lacus viverra. Integer malesuada nunc vel risus commodo viverra maecenas accumsan. Morbi quis commodo odio aenean sed adipiscing.

Nec ullamcorper sit amet risus nullam. Mi sit amet mauris commodo quis imperdiet massa. Magna eget est lorem ipsum dolor sit amet consectetur. Purus gravida quis blandit turpis. Facilisis gravida neque convallis a cras semper auctor neque. Nullam ac tortor vitae purus faucibus ornare. Sed turpis tincidunt id aliquet. Vestibulum morbi blandit cursus risus at ultrices mi. Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt id. Volutpat consequat mauris nunc congue nisi. Faucibus a pellentesque sit amet porttitor eget dolor morbi. Ut porttitor leo a diam sollicitudin tempor. Pretium nibh ipsum consequat nisl vel pretium lectus quam id. Blandit turpis cursus in hac habitasse platea dictumst quisque sagittis. Felis eget nunc lobortis mattis aliquam faucibus purus. Massa ultricies mi quis hendrerit dolor magna eget. Duis tristique sollicitudin nibh sit amet.

Eget nunc scelerisque viverra mauris. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris. Id interdum velit laoreet id donec ultrices tincidunt. Fermentum dui faucibus in ornare. Mollis aliquam ut porttitor leo a diam. Ullamcorper eget nulla facilisi etiam dignissim diam quis. Interdum varius sit amet mattis vulputate enim nulla. Tincidunt tortor aliquam nulla facilisi cras. Turpis tincidunt id aliquet risus. Felis eget nunc lobortis mattis. Sit amet risus nullam eget felis eget. Lacus sed viverra tellus in hac habitasse platea dictumst. Enim neque volutpat ac tincidunt vitae semper quis lectus nulla. Vitae tempus quam pellentesque nec nam aliquam sem et tortor. Morbi non arcu risus quis varius quam quisque.

Erat pellentesque adipiscing commodo elit at imperdiet dui accumsan. Posuere lorem ipsum dolor sit amet. Ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Feugiat sed lectus vestibulum mattis ullamcorper velit sed. Felis eget velit aliquet sagittis id. Urna nec tincidunt praesent semper. Odio aenean sed adipiscing diam donec adipiscing. Porttitor massa id neque aliquam vestibulum. Id diam maecenas ultricies mi eget mauris. Laoreet id donec ultrices tincidunt arcu non sodales neque sodales. Erat imperdiet sed euismod nisi porta lorem. Bibendum ut tristique et egestas. Ut diam quam nulla porttitor massa id. Semper eget duis at tellus at urna condimentum mattis pellentesque. Ornare suspendisse sed nisi lacus sed viverra tellus.

Enim nec dui nunc mattis enim ut tellus elementum sagittis. Elit ut aliquam purus sit amet. Nec ultrices dui sapien eget. Malesuada fames ac turpis egestas integer eget aliquet nibh. Integer quis auctor elit sed vulputate mi sit. Suspendisse ultrices gravida dictum fusce ut placerat orci. Vitae nunc sed velit dignissim sodales ut eu. Tempor orci dapibus ultrices in iaculis nunc sed. Ultricies mi quis hendrerit dolor magna eget est. Viverra tellus in hac habitasse platea dictumst.

At tellus at urna condimentum mattis pellentesque id. Ultricies mi eget mauris pharetra et ultrices. Cursus sit amet dictum sit. Urna condimentum mattis pellentesque id nibh tortor id aliquet lectus. Neque volutpat ac tincidunt vitae semper quis lectus nulla at. Velit dignissim sodales ut eu. Risus ultricies tristique nulla aliquet enim tortor at auctor. Et netus et malesuada fames ac turpis egestas maecenas. Aliquet nec ullamcorper sit amet risus nullam eget. Sed libero enim sed faucibus turpis in eu. Habitasse platea dictumst quisque sagittis purus sit amet. Amet consectetur adipiscing elit ut aliquam purus sit amet. Sed ullamcorper morbi tincidunt ornare massa eget. Commodo nulla facilisi nullam vehicula ipsum a. Elit duis tristique sollicitudin nibh sit amet. Quis varius quam quisque id diam. Mi quis hendrerit dolor magna eget est lorem ipsum dolor. Eget velit aliquet sagittis id consectetur. Commodo quis imperdiet massa tincidunt nunc.

Pharetra diam sit amet nisl suscipit adipiscing. Lacinia quis vel eros donec ac. Vitae tortor condimentum lacinia quis vel. Massa eget egestas purus viverra accumsan in nisl nisi scelerisque. Gravida cum sociis natoque penatibus et magnis dis parturient. Orci dapibus ultrices in iaculis. Faucibus nisl tincidunt eget nullam non nisi est sit amet. Rhoncus dolor purus non enim praesent. Condimentum id venenatis a condimentum. Cras pulvinar mattis nunc sed blandit libero. Ultricies tristique nulla aliquet enim tortor at auctor. Sociis natoque penatibus et magnis dis parturient montes. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit. Id semper risus in hendrerit gravida. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Mattis pellentesque id nibh tortor id aliquet.

Sit amet purus gravida quis blandit. Vel risus commodo viverra maecenas. Fermentum dui faucibus in ornare quam viverra orci sagittis. Facilisi morbi tempus iaculis urna id volutpat lacus laoreet. Mauris commodo quis imperdiet massa. Morbi enim nunc faucibus a pellentesque sit amet porttitor. Eu turpis egestas pretium aenean pharetra magna ac placerat vestibulum. Massa tincidunt dui ut ornare. Mauris rhoncus aenean vel elit scelerisque. At elementum eu facilisis sed odio morbi quis. Facilisi cras fermentum odio eu feugiat pretium. Etiam sit amet nisl purus in mollis.

Nibh nisl condimentum id venenatis a. Malesuada nunc vel risus commodo. At ultrices mi tempus imperdiet nulla malesuada. Mi quis hendrerit dolor magna eget. Duis tristique sollicitudin nibh sit amet commodo. Quam id leo in vitae turpis massa sed elementum. In mollis nunc sed id semper risus in hendrerit. Scelerisque varius morbi enim nunc. Aliquam purus sit amet luctus venenatis lectus magna. Tortor at risus viverra adipiscing at in tellus integer feugiat. Vitae justo eget magna fermentum iaculis eu non. Et netus et malesuada fames ac turpis. Eu facilisis sed odio morbi quis. Quisque sagittis purus sit amet volutpat consequat mauris nunc congue. Sit amet mattis vulputate enim nulla aliquet. In fermentum posuere urna nec tincidunt praesent. Dolor sed viverra ipsum nunc. Eget mauris pharetra et ultrices neque ornare aenean euismod elementum.

Enim blandit volutpat maecenas volutpat blandit aliquam etiam. Arcu ac tortor dignissim convallis aenean. Diam sollicitudin tempor id eu nisl nunc. Laoreet sit amet cursus sit amet dictum sit amet. Scelerisque in dictum non consectetur a erat nam at lectus. Lorem dolor sed viverra ipsum nunc aliquet bibendum enim facilisis. Nullam vehicula ipsum a arcu cursus vitae. Id diam maecenas ultricies mi eget mauris pharetra. Facilisi morbi tempus iaculis urna. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Semper risus in hendrerit gravida rutrum quisque. Scelerisque purus semper eget duis. Iaculis urna id volutpat lacus. Sagittis orci a scelerisque purus semper eget duis at. Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere.

Dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim. Facilisi etiam dignissim diam quis enim. Consequat mauris nunc congue nisi vitae. Nunc id cursus metus aliquam eleifend. Sed risus pretium quam vulputate dignissim. Tincidunt praesent semper feugiat nibh sed pulvinar proin. Morbi leo urna molestie at elementum eu facilisis sed. Augue ut lectus arcu bibendum at varius. Sit amet nulla facilisi morbi. Eget dolor morbi non arcu risus quis varius. Quam nulla porttitor massa id neque aliquam vestibulum. Tortor at auctor urna nunc. Nibh cras pulvinar mattis nunc sed blandit. Mi tempus imperdiet nulla malesuada pellentesque elit eget gravida.

Porta nibh venenatis cras sed felis. Ante metus dictum at tempor. At imperdiet dui accumsan sit amet nulla facilisi morbi. Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Justo nec ultrices dui sapien. Lorem ipsum dolor sit amet consectetur adipiscing elit. Malesuada pellentesque elit eget gravida cum. Adipiscing elit ut aliquam purus sit amet luctus venenatis. Eu volutpat odio facilisis mauris. Neque ornare aenean euismod elementum nisi quis eleifend. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper.

Id faucibus nisl tincidunt eget nullam. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Arcu bibendum at varius vel pharetra vel turpis. Cursus sit amet dictum sit amet justo donec enim. Purus non enim praesent elementum facilisis leo vel fringilla est. Pharetra vel turpis nunc eget. At quis risus sed vulputate. In hac habitasse platea dictumst quisque sagittis purus. Scelerisque eleifend donec pretium vulputate. Fermentum dui faucibus in ornare. Ut eu sem integer vitae. Justo donec enim diam vulputate ut pharetra. Dui nunc mattis enim ut tellus elementum sagittis. Sollicitudin nibh sit amet commodo nulla. Egestas diam in arcu cursus.

Ac placerat vestibulum lectus mauris. Erat imperdiet sed euismod nisi. Turpis massa tincidunt dui ut. At imperdiet dui accumsan sit amet nulla facilisi morbi. Enim ut tellus elementum sagittis. Dis parturient montes nascetur ridiculus. Elementum integer enim neque volutpat ac tincidunt vitae semper. Lectus proin nibh nisl condimentum id venenatis. Aenean euismod elementum nisi quis. Tristique nulla aliquet enim tortor at. Eu facilisis sed odio morbi quis commodo odio aenean. Sit amet facilisis magna etiam. In fermentum et sollicitudin ac orci phasellus egestas tellus.

Ultricies leo integer malesuada nunc vel risus commodo viverra maecenas. Sapien nec sagittis aliquam malesuada bibendum arcu. Commodo nulla facilisi nullam vehicula ipsum. Odio eu feugiat pretium nibh ipsum consequat nisl vel. Massa eget egestas purus viverra accumsan in. Aliquam id diam maecenas ultricies mi eget mauris pharetra et. Ante in nibh mauris cursus mattis molestie a iaculis at. Morbi tincidunt augue interdum velit euismod. Ipsum dolor sit amet consectetur adipiscing elit ut. Magna fermentum iaculis eu non diam. Sem nulla pharetra diam sit. Ornare suspendisse sed nisi lacus sed viverra tellus in hac. Pellentesque habitant morbi tristique senectus. Varius sit amet mattis vulputate enim nulla aliquet porttitor.

Vivamus arcu felis bibendum ut tristique. Elit ut aliquam purus sit. Libero id faucibus nisl tincidunt eget nullam non nisi est. Varius vel pharetra vel turpis nunc eget lorem dolor sed. Aliquet bibendum enim facilisis gravida neque convallis a cras. Nunc mi ipsum faucibus vitae aliquet. Non nisi est sit amet facilisis magna etiam. Morbi leo urna molestie at elementum eu facilisis sed. Massa massa ultricies mi quis. Volutpat blandit aliquam etiam erat velit scelerisque in. Et magnis dis parturient montes nascetur.

Eu turpis egestas pretium aenean. Duis ut diam quam nulla. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Eget mauris pharetra et ultrices neque. Cras pulvinar mattis nunc sed blandit libero volutpat sed. Arcu bibendum at varius vel pharetra vel. Eget egestas purus viverra accumsan in nisl nisi scelerisque. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Bibendum neque egestas congue quisque egestas diam in arcu cursus. In ornare quam viverra orci sagittis eu volutpat. Sed viverra ipsum nunc aliquet bibendum enim facilisis gravida. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Nisl purus in mollis nunc sed id semper. Enim sed faucibus turpis in eu mi bibendum neque egestas. Augue lacus viverra vitae congue eu consequat ac.

Velit dignissim sodales ut eu sem integer vitae justo eget. Id nibh tortor id aliquet. Justo eget magna fermentum iaculis eu. Tellus elementum sagittis vitae et. Duis convallis convallis tellus id interdum. Lorem ipsum dolor sit amet consectetur adipiscing elit duis. Posuere urna nec tincidunt praesent semper feugiat. Habitant morbi tristique senectus et netus et malesuada fames. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Id aliquet risus feugiat in ante metus dictum at. Purus in mollis nunc sed id semper. Ut tortor pretium viverra suspendisse potenti nullam. Ultrices neque ornare aenean euismod elementum nisi quis. Eu nisl nunc mi ipsum faucibus vitae aliquet nec. Mauris augue neque gravida in fermentum. Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus.

Pellentesque diam volutpat commodo sed. Rhoncus dolor purus non enim praesent elementum facilisis leo. Gravida neque convallis a cras semper auctor. Turpis nunc eget lorem dolor sed viverra. Nisi lacus sed viverra tellus in hac habitasse platea. Metus vulputate eu scelerisque felis. Pharetra magna ac placerat vestibulum lectus mauris ultrices eros in. Sed risus pretium quam vulputate dignissim suspendisse in est ante. Sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum. Tellus in hac habitasse platea dictumst vestibulum rhoncus. Lorem sed risus ultricies tristique nulla aliquet enim. Tempor orci eu lobortis elementum nibh.`;

describe.sequential("RxJS Logic", () => {
  type SingleMessageData = Omit<MessageData, "targetsId"> & { targetId: bigint };
  type Output = { targetId: string, message: string; };

  const _messageHub$ = new Subject<SingleMessageData>();
  const output: Output[] = [];
  _messageHub$
    .pipe(
      // separate each target group
      groupBy((info) => info.targetId),
      mergeMap((group) =>
        group.pipe(
          // prevent duplicate
          distinctUntilKeyChanged("payload"),
          // group burst messages
          bufferTime(1000)
        )
      )
    )
    .subscribe((info) => {
      if (info.length < 1 || info[0] === undefined) return;

      // Telegram limits each message box to have 4096 UTF-8 characters
      const messages: string[] = [];
      let currentMessage = "";
      // This is actually the safe length of `\n${"-".repeat(20)}\n\n`
      const MAGIC_DELIMITER_NUMBER = 26; 
      for (const item of info) {
        if (currentMessage === "") {
          currentMessage = item.payload;
          continue;
        }

        if (currentMessage.length + item.payload.length + MAGIC_DELIMITER_NUMBER >= 4096) {
          // Push everything that's contained in currentMessages to messages.
          messages.push(currentMessage);
          // Reset the currentMessage to current item payload.
          currentMessage = item.payload;
          // See if currentMessage exceeds 4096, we'll just push it.
          if (currentMessage.length >= 4096) {
            messages.push(currentMessage.slice(0, 4096));
            // Then we reset the currentMessage
            currentMessage = "";
          }
          continue;
        }

        currentMessage += `\n${"-".repeat(20)}\n\n`;
        currentMessage += item.payload;
      }

      if (currentMessage !== "") {
        messages.push(currentMessage);
      }

      for (const message of messages) {
        output.push({ targetId: info[0]!.targetId.toString(), message });
      }
    });

  _messageHub$.next({
    event: "pull_request.closed",
    payload: "The quick brown fox jumps over the lazy dog",
    targetId: 1n
  });

  _messageHub$.next({
    event: "pull_request.closed",
    payload: "Waltz, bad nymph, for quick jigs vex",
    targetId: 1n
  });

  _messageHub$.next({
    event: "pull_request.closed",
    payload: "The quick brown fox jumps over the lazy dog".repeat(1024),
    targetId: 1n
  });

  for (const script of loremIpsum.split("\n\n")) {
    _messageHub$.next({
      event: "pull_request.closed",
      payload: script,
      targetId: 1n
    });
  }

  it.sequential("Sleep", () => {
    expect(new Promise((resolve) => setTimeout(resolve, 5000))).resolves.toBeUndefined();
  });
  it.sequential("Should be able to push a regular message to output", () => {
    const firstItem = output.at(0);
    expect(firstItem).not.toBeUndefined();
    expect(firstItem?.targetId).toStrictEqual("1");
    expect(firstItem?.message).toStrictEqual("The quick brown fox jumps over the lazy dog\n" +
    "--------------------\n" +
    "\n" +
    "Waltz, bad nymph, for quick jigs vex");
    expect(firstItem?.message.length).toBeLessThanOrEqual(4096);
  });

  it.sequential("Should be able to push a very long message to output", () => {
    const secondItem = output.at(1);
    expect(secondItem).not.toBeUndefined();
    expect(secondItem?.targetId).toStrictEqual("1");
    expect(secondItem?.message).toStrictEqual("The quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick brown fox jumps over the lazy dogThe quick b");
    expect(secondItem?.message.length).toBeLessThanOrEqual(4096);
  });

  describe.sequential("Should be able to hold long message to another message (lorem ipsum one)", () => {
    it("thirdItem", () => {
      const thirdItem = output.at(2);
      expect(thirdItem).not.toBeUndefined();
      expect(thirdItem?.targetId).toStrictEqual("1");
      expect(thirdItem?.message).toStrictEqual("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Velit laoreet id donec ultrices. Sed cras ornare arcu dui vivamus arcu. At consectetur lorem donec massa sapien faucibus et molestie. Quis vel eros donec ac odio tempor orci dapibus. Arcu cursus euismod quis viverra nibh cras pulvinar mattis. Volutpat sed cras ornare arcu dui vivamus arcu felis. Dictum non consectetur a erat nam. Dolor morbi non arcu risus quis. Sit amet nisl purus in mollis nunc. Tempus urna et pharetra pharetra. Amet nulla facilisi morbi tempus.\n" +
      "--------------------\n" +
      "\n" +
      "Platea dictumst quisque sagittis purus. In nulla posuere sollicitudin aliquam ultrices sagittis. Nisl tincidunt eget nullam non nisi est sit amet. Metus vulputate eu scelerisque felis. Morbi tristique senectus et netus et malesuada fames ac. Pellentesque dignissim enim sit amet venenatis urna cursus eget. Eu tincidunt tortor aliquam nulla facilisi cras fermentum odio. Purus ut faucibus pulvinar elementum integer enim. Consectetur adipiscing elit duis tristique sollicitudin nibh sit amet commodo. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Ipsum suspendisse ultrices gravida dictum fusce ut placerat orci nulla. Id velit ut tortor pretium.\n" +
      "--------------------\n" +
      "\n" +
      "Pellentesque habitant morbi tristique senectus et netus et malesuada fames. Nam libero justo laoreet sit amet cursus. Rhoncus mattis rhoncus urna neque viverra justo. Posuere ac ut consequat semper viverra. Molestie at elementum eu facilisis sed odio morbi. Vestibulum lectus mauris ultrices eros. Maecenas ultricies mi eget mauris pharetra et ultrices neque ornare. Ante in nibh mauris cursus. Ut pharetra sit amet aliquam id diam maecenas. Quis viverra nibh cras pulvinar. Adipiscing elit pellentesque habitant morbi tristique senectus. Aliquet lectus proin nibh nisl. Iaculis urna id volutpat lacus laoreet non curabitur. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Quis eleifend quam adipiscing vitae. Arcu cursus euismod quis viverra nibh cras pulvinar.\n" +
      "--------------------\n" +
      "\n" +
      "Suspendisse ultrices gravida dictum fusce ut placerat orci nulla. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing. Ut eu sem integer vitae. Massa ultricies mi quis hendrerit dolor magna. Euismod elementum nisi quis eleifend quam adipiscing vitae proin. Augue neque gravida in fermentum et sollicitudin ac orci phasellus. Nulla pellentesque dignissim enim sit amet venenatis. Viverra ipsum nunc aliquet bibendum enim. Vivamus at augue eget arcu dictum varius. Purus in mollis nunc sed id semper risus in. In arcu cursus euismod quis viverra nibh cras pulvinar mattis. Commodo elit at imperdiet dui accumsan. Dictum sit amet justo donec enim diam vulputate ut pharetra.\n" +
      "--------------------\n" +
      "\n" +
      "Tortor id aliquet lectus proin nibh. Aliquam faucibus purus in massa tempor. Euismod in pellentesque massa placerat duis ultricies lacus sed turpis. Vitae proin sagittis nisl rhoncus mattis rhoncus. Porta non pulvinar neque laoreet suspendisse interdum consectetur libero. Turpis cursus in hac habitasse platea dictumst quisque sagittis purus. Mauris pellentesque pulvinar pellentesque habitant morbi. Donec pretium vulputate sapien nec. At imperdiet dui accumsan sit amet nulla facilisi morbi tempus. Odio ut enim blandit volutpat maecenas volutpat. Parturient montes nascetur ridiculus mus. Imperdiet dui accumsan sit amet nulla. Vestibulum rhoncus est pellentesque elit ullamcorper dignissim cras tincidunt. Lectus mauris ultrices eros in cursus turpis. Ut etiam sit amet nisl purus in mollis nunc. Viverra vitae congue eu consequat ac felis. Faucibus vitae aliquet nec ullamcorper sit amet risus. Sagittis vitae et leo duis. Nunc aliquet bibendum enim facilisis gravida. Scelerisque in dictum non consectetur a erat nam at.");
      expect(thirdItem?.message.length).toBeLessThanOrEqual(4096);
    });


    it("fourthItem", () => {
      const fourthItem = output.at(3);
      expect(fourthItem).not.toBeUndefined();
      expect(fourthItem?.targetId).toStrictEqual("1");
      expect(fourthItem?.message).toStrictEqual("Euismod in pellentesque massa placerat duis. Non odio euismod lacinia at quis risus sed vulputate odio. Cursus turpis massa tincidunt dui ut ornare. Aenean et tortor at risus viverra adipiscing. Molestie at elementum eu facilisis sed odio morbi quis commodo. Parturient montes nascetur ridiculus mus mauris vitae ultricies leo integer. Ornare suspendisse sed nisi lacus. Condimentum vitae sapien pellentesque habitant morbi. Viverra mauris in aliquam sem fringilla ut morbi tincidunt augue. Pellentesque elit eget gravida cum sociis natoque penatibus. Ante in nibh mauris cursus mattis molestie a iaculis. Nibh tortor id aliquet lectus proin. Id porta nibh venenatis cras. Fames ac turpis egestas integer eget aliquet. Consectetur adipiscing elit pellentesque habitant morbi tristique senectus. Tortor pretium viverra suspendisse potenti nullam ac tortor vitae purus.\n" +
      "--------------------\n" +
      "\n" +
      "Maecenas pharetra convallis posuere morbi leo urna molestie at. Dapibus ultrices in iaculis nunc sed augue. Pharetra vel turpis nunc eget lorem dolor sed viverra. Mollis nunc sed id semper risus. Placerat orci nulla pellentesque dignissim enim sit amet venenatis. Odio ut sem nulla pharetra diam. Dapibus ultrices in iaculis nunc sed. Tristique senectus et netus et malesuada fames ac. Lectus urna duis convallis convallis tellus id. Elementum eu facilisis sed odio morbi quis commodo odio aenean. Ornare massa eget egestas purus. Dapibus ultrices in iaculis nunc sed augue lacus viverra. Integer malesuada nunc vel risus commodo viverra maecenas accumsan. Morbi quis commodo odio aenean sed adipiscing.\n" +
      "--------------------\n" +
      "\n" +
      "Nec ullamcorper sit amet risus nullam. Mi sit amet mauris commodo quis imperdiet massa. Magna eget est lorem ipsum dolor sit amet consectetur. Purus gravida quis blandit turpis. Facilisis gravida neque convallis a cras semper auctor neque. Nullam ac tortor vitae purus faucibus ornare. Sed turpis tincidunt id aliquet. Vestibulum morbi blandit cursus risus at ultrices mi. Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt id. Volutpat consequat mauris nunc congue nisi. Faucibus a pellentesque sit amet porttitor eget dolor morbi. Ut porttitor leo a diam sollicitudin tempor. Pretium nibh ipsum consequat nisl vel pretium lectus quam id. Blandit turpis cursus in hac habitasse platea dictumst quisque sagittis. Felis eget nunc lobortis mattis aliquam faucibus purus. Massa ultricies mi quis hendrerit dolor magna eget. Duis tristique sollicitudin nibh sit amet.\n" +
      "--------------------\n" +
      "\n" +
      "Eget nunc scelerisque viverra mauris. Pretium aenean pharetra magna ac placerat vestibulum lectus mauris. Id interdum velit laoreet id donec ultrices tincidunt. Fermentum dui faucibus in ornare. Mollis aliquam ut porttitor leo a diam. Ullamcorper eget nulla facilisi etiam dignissim diam quis. Interdum varius sit amet mattis vulputate enim nulla. Tincidunt tortor aliquam nulla facilisi cras. Turpis tincidunt id aliquet risus. Felis eget nunc lobortis mattis. Sit amet risus nullam eget felis eget. Lacus sed viverra tellus in hac habitasse platea dictumst. Enim neque volutpat ac tincidunt vitae semper quis lectus nulla. Vitae tempus quam pellentesque nec nam aliquam sem et tortor. Morbi non arcu risus quis varius quam quisque.\n" +
      "--------------------\n" +
      "\n" +
      "Erat pellentesque adipiscing commodo elit at imperdiet dui accumsan. Posuere lorem ipsum dolor sit amet. Ullamcorper eget nulla facilisi etiam dignissim diam quis enim. Feugiat sed lectus vestibulum mattis ullamcorper velit sed. Felis eget velit aliquet sagittis id. Urna nec tincidunt praesent semper. Odio aenean sed adipiscing diam donec adipiscing. Porttitor massa id neque aliquam vestibulum. Id diam maecenas ultricies mi eget mauris. Laoreet id donec ultrices tincidunt arcu non sodales neque sodales. Erat imperdiet sed euismod nisi porta lorem. Bibendum ut tristique et egestas. Ut diam quam nulla porttitor massa id. Semper eget duis at tellus at urna condimentum mattis pellentesque. Ornare suspendisse sed nisi lacus sed viverra tellus.");
      expect(fourthItem?.message.length).toBeLessThanOrEqual(4096);
    });

    it("fifthItem", () => {
      const fifthItem = output.at(4);
      expect(fifthItem).not.toBeUndefined();
      expect(fifthItem?.targetId).toStrictEqual("1");
      expect(fifthItem?.message).toStrictEqual("Enim nec dui nunc mattis enim ut tellus elementum sagittis. Elit ut aliquam purus sit amet. Nec ultrices dui sapien eget. Malesuada fames ac turpis egestas integer eget aliquet nibh. Integer quis auctor elit sed vulputate mi sit. Suspendisse ultrices gravida dictum fusce ut placerat orci. Vitae nunc sed velit dignissim sodales ut eu. Tempor orci dapibus ultrices in iaculis nunc sed. Ultricies mi quis hendrerit dolor magna eget est. Viverra tellus in hac habitasse platea dictumst.\n" +
      "--------------------\n" +
      "\n" +
      "At tellus at urna condimentum mattis pellentesque id. Ultricies mi eget mauris pharetra et ultrices. Cursus sit amet dictum sit. Urna condimentum mattis pellentesque id nibh tortor id aliquet lectus. Neque volutpat ac tincidunt vitae semper quis lectus nulla at. Velit dignissim sodales ut eu. Risus ultricies tristique nulla aliquet enim tortor at auctor. Et netus et malesuada fames ac turpis egestas maecenas. Aliquet nec ullamcorper sit amet risus nullam eget. Sed libero enim sed faucibus turpis in eu. Habitasse platea dictumst quisque sagittis purus sit amet. Amet consectetur adipiscing elit ut aliquam purus sit amet. Sed ullamcorper morbi tincidunt ornare massa eget. Commodo nulla facilisi nullam vehicula ipsum a. Elit duis tristique sollicitudin nibh sit amet. Quis varius quam quisque id diam. Mi quis hendrerit dolor magna eget est lorem ipsum dolor. Eget velit aliquet sagittis id consectetur. Commodo quis imperdiet massa tincidunt nunc.\n" +
      "--------------------\n" +
      "\n" +
      "Pharetra diam sit amet nisl suscipit adipiscing. Lacinia quis vel eros donec ac. Vitae tortor condimentum lacinia quis vel. Massa eget egestas purus viverra accumsan in nisl nisi scelerisque. Gravida cum sociis natoque penatibus et magnis dis parturient. Orci dapibus ultrices in iaculis. Faucibus nisl tincidunt eget nullam non nisi est sit amet. Rhoncus dolor purus non enim praesent. Condimentum id venenatis a condimentum. Cras pulvinar mattis nunc sed blandit libero. Ultricies tristique nulla aliquet enim tortor at auctor. Sociis natoque penatibus et magnis dis parturient montes. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit. Id semper risus in hendrerit gravida. Ligula ullamcorper malesuada proin libero nunc consequat interdum varius sit. Mattis pellentesque id nibh tortor id aliquet.\n" +
      "--------------------\n" +
      "\n" +
      "Sit amet purus gravida quis blandit. Vel risus commodo viverra maecenas. Fermentum dui faucibus in ornare quam viverra orci sagittis. Facilisi morbi tempus iaculis urna id volutpat lacus laoreet. Mauris commodo quis imperdiet massa. Morbi enim nunc faucibus a pellentesque sit amet porttitor. Eu turpis egestas pretium aenean pharetra magna ac placerat vestibulum. Massa tincidunt dui ut ornare. Mauris rhoncus aenean vel elit scelerisque. At elementum eu facilisis sed odio morbi quis. Facilisi cras fermentum odio eu feugiat pretium. Etiam sit amet nisl purus in mollis.\n" +
      "--------------------\n" +
      "\n" +
      "Nibh nisl condimentum id venenatis a. Malesuada nunc vel risus commodo. At ultrices mi tempus imperdiet nulla malesuada. Mi quis hendrerit dolor magna eget. Duis tristique sollicitudin nibh sit amet commodo. Quam id leo in vitae turpis massa sed elementum. In mollis nunc sed id semper risus in hendrerit. Scelerisque varius morbi enim nunc. Aliquam purus sit amet luctus venenatis lectus magna. Tortor at risus viverra adipiscing at in tellus integer feugiat. Vitae justo eget magna fermentum iaculis eu non. Et netus et malesuada fames ac turpis. Eu facilisis sed odio morbi quis. Quisque sagittis purus sit amet volutpat consequat mauris nunc congue. Sit amet mattis vulputate enim nulla aliquet. In fermentum posuere urna nec tincidunt praesent. Dolor sed viverra ipsum nunc. Eget mauris pharetra et ultrices neque ornare aenean euismod elementum.");
      expect(fifthItem?.message.length).toBeLessThanOrEqual(4096);
    });

    it("sixthItem", () => {
      const sixthItem = output.at(5);
      expect(sixthItem).not.toBeUndefined();
      expect(sixthItem?.targetId).toStrictEqual("1");
      expect(sixthItem?.message).toStrictEqual("Enim blandit volutpat maecenas volutpat blandit aliquam etiam. Arcu ac tortor dignissim convallis aenean. Diam sollicitudin tempor id eu nisl nunc. Laoreet sit amet cursus sit amet dictum sit amet. Scelerisque in dictum non consectetur a erat nam at lectus. Lorem dolor sed viverra ipsum nunc aliquet bibendum enim facilisis. Nullam vehicula ipsum a arcu cursus vitae. Id diam maecenas ultricies mi eget mauris pharetra. Facilisi morbi tempus iaculis urna. Sit amet consectetur adipiscing elit duis tristique sollicitudin nibh. Semper risus in hendrerit gravida rutrum quisque. Scelerisque purus semper eget duis. Iaculis urna id volutpat lacus. Sagittis orci a scelerisque purus semper eget duis at. Pulvinar etiam non quam lacus suspendisse faucibus interdum posuere.\n" +
      "--------------------\n" +
      "\n" +
      "Dictumst vestibulum rhoncus est pellentesque elit ullamcorper dignissim. Facilisi etiam dignissim diam quis enim. Consequat mauris nunc congue nisi vitae. Nunc id cursus metus aliquam eleifend. Sed risus pretium quam vulputate dignissim. Tincidunt praesent semper feugiat nibh sed pulvinar proin. Morbi leo urna molestie at elementum eu facilisis sed. Augue ut lectus arcu bibendum at varius. Sit amet nulla facilisi morbi. Eget dolor morbi non arcu risus quis varius. Quam nulla porttitor massa id neque aliquam vestibulum. Tortor at auctor urna nunc. Nibh cras pulvinar mattis nunc sed blandit. Mi tempus imperdiet nulla malesuada pellentesque elit eget gravida.\n" +
      "--------------------\n" +
      "\n" +
      "Porta nibh venenatis cras sed felis. Ante metus dictum at tempor. At imperdiet dui accumsan sit amet nulla facilisi morbi. Phasellus egestas tellus rutrum tellus pellentesque eu tincidunt. Justo nec ultrices dui sapien. Lorem ipsum dolor sit amet consectetur adipiscing elit. Malesuada pellentesque elit eget gravida cum. Adipiscing elit ut aliquam purus sit amet luctus venenatis. Eu volutpat odio facilisis mauris. Neque ornare aenean euismod elementum nisi quis eleifend. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque purus semper.\n" +
      "--------------------\n" +
      "\n" +
      "Id faucibus nisl tincidunt eget nullam. Nunc pulvinar sapien et ligula ullamcorper malesuada proin libero. Arcu bibendum at varius vel pharetra vel turpis. Cursus sit amet dictum sit amet justo donec enim. Purus non enim praesent elementum facilisis leo vel fringilla est. Pharetra vel turpis nunc eget. At quis risus sed vulputate. In hac habitasse platea dictumst quisque sagittis purus. Scelerisque eleifend donec pretium vulputate. Fermentum dui faucibus in ornare. Ut eu sem integer vitae. Justo donec enim diam vulputate ut pharetra. Dui nunc mattis enim ut tellus elementum sagittis. Sollicitudin nibh sit amet commodo nulla. Egestas diam in arcu cursus.\n" +
      "--------------------\n" +
      "\n" +
      "Ac placerat vestibulum lectus mauris. Erat imperdiet sed euismod nisi. Turpis massa tincidunt dui ut. At imperdiet dui accumsan sit amet nulla facilisi morbi. Enim ut tellus elementum sagittis. Dis parturient montes nascetur ridiculus. Elementum integer enim neque volutpat ac tincidunt vitae semper. Lectus proin nibh nisl condimentum id venenatis. Aenean euismod elementum nisi quis. Tristique nulla aliquet enim tortor at. Eu facilisis sed odio morbi quis commodo odio aenean. Sit amet facilisis magna etiam. In fermentum et sollicitudin ac orci phasellus egestas tellus.\n" +
      "--------------------\n" +
      "\n" +
      "Ultricies leo integer malesuada nunc vel risus commodo viverra maecenas. Sapien nec sagittis aliquam malesuada bibendum arcu. Commodo nulla facilisi nullam vehicula ipsum. Odio eu feugiat pretium nibh ipsum consequat nisl vel. Massa eget egestas purus viverra accumsan in. Aliquam id diam maecenas ultricies mi eget mauris pharetra et. Ante in nibh mauris cursus mattis molestie a iaculis at. Morbi tincidunt augue interdum velit euismod. Ipsum dolor sit amet consectetur adipiscing elit ut. Magna fermentum iaculis eu non diam. Sem nulla pharetra diam sit. Ornare suspendisse sed nisi lacus sed viverra tellus in hac. Pellentesque habitant morbi tristique senectus. Varius sit amet mattis vulputate enim nulla aliquet porttitor.");
      expect(sixthItem?.message.length).toBeLessThanOrEqual(4096);
    });

    it("seventhItem", () => {
      const seventhItem = output.at(6);
      expect(seventhItem).not.toBeUndefined();
      expect(seventhItem?.targetId).toStrictEqual("1");
      expect(seventhItem?.message).toStrictEqual("Vivamus arcu felis bibendum ut tristique. Elit ut aliquam purus sit. Libero id faucibus nisl tincidunt eget nullam non nisi est. Varius vel pharetra vel turpis nunc eget lorem dolor sed. Aliquet bibendum enim facilisis gravida neque convallis a cras. Nunc mi ipsum faucibus vitae aliquet. Non nisi est sit amet facilisis magna etiam. Morbi leo urna molestie at elementum eu facilisis sed. Massa massa ultricies mi quis. Volutpat blandit aliquam etiam erat velit scelerisque in. Et magnis dis parturient montes nascetur.\n" +
      "--------------------\n" +
      "\n" +
      "Eu turpis egestas pretium aenean. Duis ut diam quam nulla. Vitae ultricies leo integer malesuada nunc vel risus commodo viverra. Eget mauris pharetra et ultrices neque. Cras pulvinar mattis nunc sed blandit libero volutpat sed. Arcu bibendum at varius vel pharetra vel. Eget egestas purus viverra accumsan in nisl nisi scelerisque. Quis commodo odio aenean sed adipiscing diam donec adipiscing tristique. Bibendum neque egestas congue quisque egestas diam in arcu cursus. In ornare quam viverra orci sagittis eu volutpat. Sed viverra ipsum nunc aliquet bibendum enim facilisis gravida. Aliquam purus sit amet luctus venenatis lectus magna fringilla. Nisl purus in mollis nunc sed id semper. Enim sed faucibus turpis in eu mi bibendum neque egestas. Augue lacus viverra vitae congue eu consequat ac.\n" +
      "--------------------\n" +
      "\n" +
      "Velit dignissim sodales ut eu sem integer vitae justo eget. Id nibh tortor id aliquet. Justo eget magna fermentum iaculis eu. Tellus elementum sagittis vitae et. Duis convallis convallis tellus id interdum. Lorem ipsum dolor sit amet consectetur adipiscing elit duis. Posuere urna nec tincidunt praesent semper feugiat. Habitant morbi tristique senectus et netus et malesuada fames. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Id aliquet risus feugiat in ante metus dictum at. Purus in mollis nunc sed id semper. Ut tortor pretium viverra suspendisse potenti nullam. Ultrices neque ornare aenean euismod elementum nisi quis. Eu nisl nunc mi ipsum faucibus vitae aliquet nec. Mauris augue neque gravida in fermentum. Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus.\n" +
      "--------------------\n" +
      "\n" +
      "Pellentesque diam volutpat commodo sed. Rhoncus dolor purus non enim praesent elementum facilisis leo. Gravida neque convallis a cras semper auctor. Turpis nunc eget lorem dolor sed viverra. Nisi lacus sed viverra tellus in hac habitasse platea. Metus vulputate eu scelerisque felis. Pharetra magna ac placerat vestibulum lectus mauris ultrices eros in. Sed risus pretium quam vulputate dignissim suspendisse in est ante. Sem nulla pharetra diam sit amet nisl suscipit adipiscing bibendum. Tellus in hac habitasse platea dictumst vestibulum rhoncus. Lorem sed risus ultricies tristique nulla aliquet enim. Tempor orci eu lobortis elementum nibh.");
      expect(seventhItem?.message.length).toBeLessThanOrEqual(4096);
    });
  });
});