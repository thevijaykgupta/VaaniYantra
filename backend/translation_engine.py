import logging
import config
import utils

logger = logging.getLogger("translator")

# Map Whisper language codes to Marian language codes
LANG_MAP = {
    "en": "en",
    "hi": "hi",
    "ta": "ta",
    "te": "te",
    "kn": "kn",
    "ml": "ml",
    "ur": "ur",
}


class Translator:
    """
    Translation engine with proper language mapping.
    """

    def __init__(self, backend=config.TRANSLATION_BACKEND):
        self.backend = backend
        self.models = {}  # Cache loaded models

    def translate(self, text: str, source_lang="auto", target_lang="en") -> str:
        """
        Translate text using configured backend.
        """
        if not text.strip():
            return ""

        # ✅ SAME LANGUAGE → NO TRANSLATION (fixes Marian crash)
        if source_lang == target_lang:
            return text

        try:
            if self.backend == "marian":
                return self._translate_marian(text, source_lang, target_lang)
            elif self.backend == "m2m100":
                return self._translate_m2m100(text, source_lang, target_lang)
            else:
                return self._translate_cloud(text, source_lang, target_lang)
        except Exception as e:
            logger.error(f"Translation failed: {e}, returning original text")
            return text

    def _translate_marian(self, text, source_lang, target_lang):
        """
        Use MarianMT models for translation with proper language mapping.
        """
        from transformers import MarianMTModel, MarianTokenizer

        src = LANG_MAP.get(source_lang, "en")  # Map Whisper language to Marian
        tgt = target_lang

        model_name = f"Helsinki-NLP/opus-mt-{src}-{tgt}"

        if model_name not in self.models:
            try:
                tokenizer = MarianTokenizer.from_pretrained(model_name)
                model = MarianMTModel.from_pretrained(model_name)
                self.models[model_name] = (tokenizer, model)
                logger.info(f"Loaded Marian model: {model_name}")
            except Exception as e:
                logger.error(f"Failed to load Marian model {model_name}: {e}")
                return text

        tokenizer, model = self.models[model_name]
        batch = tokenizer([text], return_tensors="pt", padding=True)
        generated = model.generate(**batch, max_length=256)
        return tokenizer.decode(generated[0], skip_special_tokens=True)

    def _translate_m2m100(self, text, source_lang, target_lang):
        """
        Use M2M100 models for multilingual translation.

        ⚠️ NOTE:
        - Heavy model (~1.5GB RAM)
        - Works with language codes like: en, hi, ta, kn, fr
        - Can be enabled later if needed
        """
        from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer

        model_name = "facebook/m2m100_418M"

        if model_name not in self.models:
            tokenizer = M2M100Tokenizer.from_pretrained(model_name)
            model = M2M100ForConditionalGeneration.from_pretrained(model_name)
            self.models[model_name] = (tokenizer, model)

        tokenizer, model = self.models[model_name]

        tokenizer.src_lang = source_lang
        encoded = tokenizer(text, return_tensors="pt")
        generated_tokens = model.generate(
            **encoded,
            forced_bos_token_id=tokenizer.get_lang_id(target_lang)
        )
        return tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]

    def _translate_cloud(self, text, source_lang, target_lang):
        """
        Placeholder for cloud translation service.

        Safe fallback, never crashes.
        """
        logger.info("Using cloud translation (placeholder)")
        return text