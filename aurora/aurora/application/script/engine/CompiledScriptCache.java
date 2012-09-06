package aurora.application.script.engine;

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Script;

/**
 * Every piece of script will be compiled before execute.And the compilation is
 * independent from runtime scope,So we can cache the compiled script,to reduce
 * the full-execute time(each piece of script will only be compiled once).<br/>
 * 
 * @author jessen
 * 
 */
public class CompiledScriptCache implements CompiledScriptCacheMBean {
	private static CompiledScriptCache instance = new CompiledScriptCache();

	private ConcurrentHashMap<Key, Value> scriptCache = new ConcurrentHashMap<Key, Value>(
			256);

	private CompiledScriptCache() {
	}

	public static CompiledScriptCache getInstance() {
		return instance;
	}

	/**
	 * try to get Script from cache,if not success(not exists,or optimizeLevel
	 * not compatible ) then {@code source} will be compiled,and cached
	 * 
	 * @param source
	 * @param cx
	 * @param sourceName
	 * @return
	 */
	public synchronized Script getScript(String source, Context cx,
			String sourceName) {
		Key k = new Key(source, cx.getOptimizationLevel());
		Value v = scriptCache.get(k);
		if (v == null) {
			v = new Value(cx.compileString(source, sourceName, 0, null));
			scriptCache.put(k, v);
		} else {
			v.lastUseTime = System.currentTimeMillis();
			v.hits.incrementAndGet();
		}
		return v.script;
	}

	/**
	 * 
	 * {@link #getScript(String , Context , String )}<br/>
	 * the sourceName is &lt;Unknown source&gt;
	 * 
	 * @param source
	 * @param cx
	 * @return
	 */
	public Script getScript(String source, Context cx) {
		return getScript(source, cx, "<Unknown source>");
	}

	/**
	 * 
	 * @param file
	 * @param cx
	 * @return
	 */
	public synchronized Script getScript(File file, Context cx) {
		Key k = new Key(file, cx.getOptimizationLevel());
		Value v = scriptCache.get(k);
		if (v == null || k.lastModif != v.lastModif) {
			FileReader fr = null;
			try {
				fr = new FileReader(file);
				v = new Value(cx.compileReader(fr, file.getName(), 0, null),
						k.lastModif);
				scriptCache.put(k, v);
			} catch (Exception e) {
				return null;
			} finally {
				if (fr != null)
					try {
						fr.close();
					} catch (IOException e) {
					}
			}
		} else {
			v.lastUseTime = System.currentTimeMillis();
			v.hits.incrementAndGet();
		}
		return v.script;
	}

	static class Key {
		String source;
		File file;
		int optLevel;
		long lastModif;

		Key(Object s, int level) {
			if (s instanceof String)
				source = (String) s;
			else if (s instanceof File) {
				file = (File) s;
				lastModif = file.lastModified();
			}
			optLevel = level;
		}

		@Override
		public int hashCode() {
			if (file != null)
				return file.hashCode() + optLevel;
			if (source != null)
				return source.hashCode() + optLevel;
			return super.hashCode();
		}

		@Override
		public boolean equals(Object obj) {
			if (!(obj instanceof Key))
				return false;
			Key k = (Key) obj;
			return eq(source, k.source) && eq(file, k.file)
					&& optLevel == k.optLevel;
		}

		static boolean eq(Object o1, Object o2) {
			if (o1 == null)
				return o2 == null;
			return o1.equals(o2);
		}

	}

	static class Value {
		Script script;
		long lastModif;// only for file
		long compiledTime;
		long lastUseTime;
		AtomicInteger hits = new AtomicInteger(0);

		Value(Script scr) {
			this.script = scr;
			this.compiledTime = System.currentTimeMillis();
		}

		Value(Script scr, long lastModif) {
			this(scr);
			this.lastModif = lastModif;
		}
	}

	@Override
	public int getScriptSize() {
		return scriptCache.size();
	}

	@Override
	public void clearScriptCache() {
		scriptCache.clear();
	}

	@Override
	public String getScriptDetail(int idx) {
		if (idx < 0 || idx >= scriptCache.size())
			return "Index outof bounds";
		Key k = (Key) scriptCache.keySet().toArray()[idx];
		Value v = scriptCache.get(k);
		return String
				.format("compiled script object:%s\ncompiled at:%s\nlast use at:%s\nhits:%d\nsource detail:\n%s",
						v.script, new Date(v.compiledTime), new Date(
								v.lastUseTime), v.hits.intValue(),
						k.source == null ? k.file : k.source);

	}
}